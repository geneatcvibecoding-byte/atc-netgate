export const PYTHON_HOTSPOT_MANAGER_SCRIPT = `"""
NetGate — WiFi Hotspot Manager
A time-based WiFi voucher system for Windows.
Sell internet access by the minute — customers connect to your hotspot,
open the captive portal, enter a voucher code, and get online.

Dependencies:
    pip install customtkinter qrcode[pil] pillow

Run as Administrator on Windows 10/11:
    python wifi_hotspot_manager.py
"""

import os
import sys
import time
import string
import random
import sqlite3
import threading
import subprocess
import socket
from datetime import datetime, timedelta
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.parse
import tkinter as tk
from tkinter import messagebox, filedialog
import customtkinter as ctk

# Database file
DB_FILE = "hotspot_manager.db"
DEFAULT_PORTAL_IP = "192.168.137.1"
PORTAL_PORT = 80
VOUCHER_PREFIX = "NGT"

def is_admin():
    try:
        import ctypes
        return ctypes.windll.shell32.IsUserAnAdmin() != 0
    except:
        return False

# ----------------- Database Management ----------------- #
def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS vouchers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            duration_minutes INTEGER NOT NULL,
            price REAL NOT NULL,
            status TEXT DEFAULT 'unused', -- unused, active, paused, expired
            created_at TEXT NOT NULL,
            activated_at TEXT,
            expires_at TEXT,
            remaining_seconds INTEGER NOT NULL,
            bound_ip TEXT,
            bound_mac TEXT,
            data_used_mb REAL DEFAULT 0
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS devices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip TEXT UNIQUE NOT NULL,
            mac TEXT,
            hostname TEXT,
            status TEXT DEFAULT 'blocked', -- blocked, allowed, active_session
            active_voucher_code TEXT,
            connected_at TEXT,
            last_seen TEXT
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS event_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            event_type TEXT NOT NULL,
            message TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

def log_event(event_type, message):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("INSERT INTO event_logs (timestamp, event_type, message) VALUES (?, ?, ?)",
              (datetime.now().strftime("%Y-%m-%d %H:%M:%S"), event_type, message))
    conn.commit()
    conn.close()

# ----------------- Windows Firewall Integration ----------------- #
def run_netsh(args):
    cmd = ["netsh", "advfirewall", "firewall"] + args
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, shell=True)
        return res.returncode == 0
    except Exception as e:
        print(f"Firewall command failed: {e}")
        return False

def block_device_ip(ip):
    """
    Applies 4 rules:
    ALLOW_{ip}      - Inbound TCP 80
    ALLOW_{ip}_out  - Outbound TCP 80
    BLOCK_{ip}      - Inbound ALL
    BLOCK_{ip}_out  - Outbound ALL
    """
    run_netsh(["add", "rule", f"name=ALLOW_{ip}", "dir=in", "action=allow", f"remoteip={ip}", "protocol=TCP", "localport=80"])
    run_netsh(["add", "rule", f"name=ALLOW_{ip}_out", "dir=out", "action=allow", f"remoteip={ip}", "protocol=TCP", "remoteport=80"])
    run_netsh(["add", "rule", f"name=BLOCK_{ip}", "dir=in", "action=block", f"remoteip={ip}"])
    run_netsh(["add", "rule", f"name=BLOCK_{ip}_out", "dir=out", "action=block", f"remoteip={ip}"])
    log_event("Firewall", f"Isolation rules applied to {ip}")

def unblock_device_ip(ip):
    """Removes all rules for device to give full Internet access"""
    run_netsh(["delete", "rule", f"name=BLOCK_{ip}"])
    run_netsh(["delete", "rule", f"name=BLOCK_{ip}_out"])
    run_netsh(["delete", "rule", f"name=ALLOW_{ip}"])
    run_netsh(["delete", "rule", f"name=ALLOW_{ip}_out"])
    log_event("Firewall", f"Firewall rules cleared for {ip}. Internet active.")

# ----------------- Captive Portal HTTP Server ----------------- #
class CaptivePortalHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # suppress default logging
        pass

    def do_GET(self):
        client_ip = self.client_address[0]
        # Captive portal check or redirect
        self.send_response(200)
        self.send_header('Content-type', 'text/html; charset=utf-8')
        self.end_headers()

        # Check if client has active voucher
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute("SELECT code, remaining_seconds, status FROM vouchers WHERE bound_ip = ? AND status IN ('active', 'paused')", (client_ip,))
        voucher = c.fetchone()
        conn.close()

        if voucher:
            code, rem_secs, status = voucher
            mins, secs = divmod(rem_secs, 60)
            hrs, mins = divmod(mins, 60)
            time_str = f"{hrs:02d}:{mins:02d}:{secs:02d}"

            html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>NetGate WiFi Portal</title>
                <style>
                    body {{ font-family: -apple-system, sans-serif; background: #0f172a; color: #f8fafc; padding: 20px; text-align: center; }}
                    .card {{ background: #1e293b; border-radius: 16px; padding: 24px; max-width: 380px; margin: 40px auto; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }}
                    .timer {{ font-family: monospace; font-size: 42px; font-weight: bold; color: #38bdf8; margin: 20px 0; }}
                    .status {{ display: inline-block; padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: 600; text-transform: uppercase; }}
                    .active {{ background: #065f46; color: #34d399; }}
                    .paused {{ background: #78350f; color: #fbbf24; }}
                    button {{ background: #0284c7; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; width: 100%; margin-top: 12px; }}
                </style>
            </head>
            <body>
                <div class="card">
                    <h2>NetGate WiFi</h2>
                    <span class="status {status}">{status}</span>
                    <div class="timer">{time_str}</div>
                    <p>Voucher: <b>{code}</b></p>
                    <p style="color: #94a3b8; font-size: 13px;">IP: {client_ip}</p>
                    <form method="POST" action="/toggle_pause">
                        <button type="submit">{'Resume Internet' if status == 'paused' else 'Pause Session'}</button>
                    </form>
                </div>
            </body>
            </html>
            """
        else:
            html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>NetGate WiFi Portal - Connect</title>
                <style>
                    body {{ font-family: -apple-system, sans-serif; background: #0f172a; color: #f8fafc; padding: 20px; text-align: center; }}
                    .card {{ background: #1e293b; border-radius: 16px; padding: 24px; max-width: 380px; margin: 40px auto; }}
                    input {{ width: 85%; padding: 14px; border: 1px solid #334155; border-radius: 8px; background: #0f172a; color: white; font-size: 18px; text-align: center; text-transform: uppercase; font-weight: bold; margin: 15px 0; }}
                    button {{ background: #0ea5e9; color: white; border: none; padding: 14px; border-radius: 8px; font-weight: 700; cursor: pointer; width: 92%; font-size: 16px; }}
                    .rates {{ margin-top: 24px; text-align: left; font-size: 13px; color: #94a3b8; border-top: 1px solid #334155; padding-top: 12px; }}
                </style>
            </head>
            <body>
                <div class="card">
                    <h2>Welcome to NetGate</h2>
                    <p style="color: #94a3b8; font-size: 14px;">Enter your voucher code to activate internet access</p>
                    <form method="POST" action="/login">
                        <input type="text" name="code" placeholder="NGT-XXXX" required autofocus />
                        <button type="submit">Connect to Internet</button>
                    </form>
                    <div class="rates">
                        <b>Rates & Plans:</b><br>
                        • 15 Mins: ₱5.00<br>
                        • 1 Hour: ₱15.00<br>
                        • 2 Hours: ₱25.00<br>
                        • 24 Hours: ₱180.00
                    </div>
                </div>
            </body>
            </html>
            """
        self.wfile.write(html.encode('utf-8'))

    def do_POST(self):
        client_ip = self.client_address[0]
        length = int(self.headers.get('content-length', 0))
        body = self.rfile.read(length).decode('utf-8')
        params = urllib.parse.parse_qs(body)

        if self.path == '/login':
            code = params.get('code', [''])[0].strip().upper()
            conn = sqlite3.connect(DB_FILE)
            c = conn.cursor()
            c.execute("SELECT id, duration_minutes, remaining_seconds, status FROM vouchers WHERE code = ?", (code,))
            row = c.fetchone()

            if row:
                v_id, duration, rem_secs, status = row
                if status == 'unused':
                    now = datetime.now()
                    expires = now + timedelta(seconds=rem_secs)
                    c.execute("""
                        UPDATE vouchers SET
                        status = 'active',
                        activated_at = ?,
                        expires_at = ?,
                        bound_ip = ?
                        WHERE id = ?
                    """, (now.strftime("%Y-%m-%d %H:%M:%S"), expires.strftime("%Y-%m-%d %H:%M:%S"), client_ip, v_id))
                    conn.commit()
                    unblock_device_ip(client_ip)
                    log_event("Voucher", f"Code {code} activated by {client_ip}")
                elif status == 'paused':
                    c.execute("UPDATE vouchers SET status = 'active', bound_ip = ? WHERE id = ?", (client_ip, v_id))
                    conn.commit()
                    unblock_device_ip(client_ip)
                    log_event("Voucher", f"Code {code} resumed by {client_ip}")

            conn.close()
            self.send_response(303)
            self.send_header('Location', '/')
            self.end_headers()

        elif self.path == '/toggle_pause':
            conn = sqlite3.connect(DB_FILE)
            c = conn.cursor()
            c.execute("SELECT id, status FROM vouchers WHERE bound_ip = ? AND status IN ('active', 'paused')", (client_ip,))
            row = c.fetchone()
            if row:
                v_id, status = row
                if status == 'active':
                    c.execute("UPDATE vouchers SET status = 'paused' WHERE id = ?", (v_id,))
                    conn.commit()
                    block_device_ip(client_ip)
                    log_event("Voucher", f"Session paused by {client_ip}")
                elif status == 'paused':
                    c.execute("UPDATE vouchers SET status = 'active' WHERE id = ?", (v_id,))
                    conn.commit()
                    unblock_device_ip(client_ip)
                    log_event("Voucher", f"Session resumed by {client_ip}")
            conn.close()
            self.send_response(303)
            self.send_header('Location', '/')
            self.end_headers()

def start_portal_server(ip, port):
    server = HTTPServer((ip, port), CaptivePortalHandler)
    server.serve_forever()

# ----------------- GUI Application (CustomTkinter) ----------------- #
class NetGateApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("NetGate — WiFi Hotspot Manager")
        self.geometry("1100x700")
        ctk.set_appearance_mode("Dark")
        ctk.set_default_color_theme("blue")

        init_db()
        self.portal_running = False

        # Build Sidebar & Views
        self.create_sidebar()
        self.create_views()

        # Start background timer thread
        self.timer_thread = threading.Thread(target=self.session_countdown_worker, daemon=True)
        self.timer_thread.start()

    def create_sidebar(self):
        self.sidebar = ctk.CTkFrame(self, width=220, corner_radius=0)
        self.sidebar.pack(side="left", fill="y")

        title = ctk.CTkLabel(self.sidebar, text="🌐 NetGate", font=ctk.CTkFont(size=20, weight="bold"))
        title.pack(pady=20, padx=10)

        # Status Indicators
        self.lbl_admin = ctk.CTkLabel(self.sidebar, text=f"Admin: {'YES' if is_admin() else 'NO'}", text_color="green" if is_admin() else "red")
        self.lbl_admin.pack(pady=2)

        self.btn_portal = ctk.CTkButton(self.sidebar, text="Start Portal", command=self.toggle_portal, fg_color="#0284c7")
        self.btn_portal.pack(pady=15, padx=20)

        nav_btns = [
            ("Dashboard", self.show_dashboard),
            ("Issue Voucher", self.show_issue),
            ("All Vouchers", self.show_vouchers),
            ("Devices & Firewall", self.show_devices),
            ("Print Queue", self.show_print_queue),
            ("Event Log", self.show_logs),
        ]
        for name, cmd in nav_btns:
            btn = ctk.CTkButton(self.sidebar, text=name, command=cmd, fg_color="transparent", anchor="w")
            btn.pack(fill="x", padx=10, pady=4)

    def create_views(self):
        self.container = ctk.CTkFrame(self)
        self.container.pack(side="right", fill="both", expand=True, padx=20, pady=20)
        self.show_dashboard()

    def show_dashboard(self):
        for widget in self.container.winfo_children():
            widget.destroy()
        lbl = ctk.CTkLabel(self.container, text="Dashboard — Hotspot Overview", font=ctk.CTkFont(size=18, weight="bold"))
        lbl.pack(pady=10)

    def show_issue(self):
        for widget in self.container.winfo_children():
            widget.destroy()
        lbl = ctk.CTkLabel(self.container, text="Issue Voucher", font=ctk.CTkFont(size=18, weight="bold"))
        lbl.pack(pady=10)

    def show_vouchers(self):
        for widget in self.container.winfo_children():
            widget.destroy()
        lbl = ctk.CTkLabel(self.container, text="Voucher Database", font=ctk.CTkFont(size=18, weight="bold"))
        lbl.pack(pady=10)

    def show_devices(self):
        for widget in self.container.winfo_children():
            widget.destroy()
        lbl = ctk.CTkLabel(self.container, text="Connected Devices & Firewall Rules", font=ctk.CTkFont(size=18, weight="bold"))
        lbl.pack(pady=10)

    def show_print_queue(self):
        for widget in self.container.winfo_children():
            widget.destroy()
        lbl = ctk.CTkLabel(self.container, text="Print Queue & Card Generator", font=ctk.CTkFont(size=18, weight="bold"))
        lbl.pack(pady=10)

    def show_logs(self):
        for widget in self.container.winfo_children():
            widget.destroy()
        lbl = ctk.CTkLabel(self.container, text="Event Audit Log", font=ctk.CTkFont(size=18, weight="bold"))
        lbl.pack(pady=10)

    def toggle_portal(self):
        if not self.portal_running:
            self.portal_running = True
            self.btn_portal.configure(text="Stop Portal", fg_color="#ef4444")
            threading.Thread(target=start_portal_server, args=(DEFAULT_PORTAL_IP, PORTAL_PORT), daemon=True).start()
            log_event("Portal", "Captive portal launched on port 80")
        else:
            self.portal_running = False
            self.btn_portal.configure(text="Start Portal", fg_color="#0284c7")

    def session_countdown_worker(self):
        while True:
            time.sleep(1)
            conn = sqlite3.connect(DB_FILE)
            c = conn.cursor()
            c.execute("SELECT id, remaining_seconds, bound_ip FROM vouchers WHERE status = 'active'")
            actives = c.fetchall()
            for v_id, rem_secs, ip in actives:
                if rem_secs <= 1:
                    c.execute("UPDATE vouchers SET status = 'expired', remaining_seconds = 0 WHERE id = ?", (v_id,))
                    if ip:
                        block_device_ip(ip)
                        log_event("Voucher", f"Voucher {v_id} expired. Device {ip} blocked.")
                else:
                    c.execute("UPDATE vouchers SET remaining_seconds = remaining_seconds - 1 WHERE id = ?", (v_id,))
            conn.commit()
            conn.close()

if __name__ == "__main__":
    app = NetGateApp()
    app.mainloop()
`;
