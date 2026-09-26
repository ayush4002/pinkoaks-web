#!/usr/bin/env python3
"""
Pink Oaks Luxury Residences — Local Full-Stack Development Server
Handles static files, POST form submissions, and SQLite/CSV real-time lead management.
Compatible with standard Python 3 (no third-party dependencies required).
"""

import sys
import os
import json
import sqlite3
import csv
import re
from datetime import datetime, timezone
from http.server import HTTPServer, SimpleHTTPRequestHandler
import urllib.parse

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8081
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(ROOT_DIR, 'database.sqlite')
CSV_PATH = os.path.join(ROOT_DIR, 'leads.csv')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            submitted_at TEXT,
            name TEXT,
            email TEXT,
            phone TEXT,
            unit TEXT,
            message TEXT,
            page_url TEXT,
            utm_source TEXT,
            utm_campaign TEXT,
            ip TEXT
        )
    ''')
    conn.commit()
    conn.close()

    if not os.path.exists(CSV_PATH) or os.path.getsize(CSV_PATH) == 0:
        with open(CSV_PATH, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['submitted_at', 'name', 'email', 'phone', 'unit', 'message', 'page', 'utm_source', 'utm_campaign', 'ip'])

def save_lead(lead_data, client_ip):
    name = (lead_data.get('name') or '').strip()
    email = (lead_data.get('email') or '').strip()
    phone = (lead_data.get('phone') or '').strip()
    message = (lead_data.get('message') or '').strip()
    
    unit = (lead_data.get('unit') or lead_data.get('residence') or lead_data.get('title') or '').strip()
    if unit == 'Deal from Era' or not unit:
        page_url = lead_data.get('page_url') or ''
        if 'apartments' in page_url.lower():
            unit = 'Apartments Selection'
        elif 'contact' in page_url.lower():
            unit = 'General Inquiry'
        else:
            unit = 'Home Page / Book a Call'
            
    submitted_at = lead_data.get('submitted_at') or datetime.now(timezone.utc).isoformat()
    page_url = (lead_data.get('page_url') or '').strip()
    utm_source = (lead_data.get('utm_source') or '').strip()
    utm_campaign = (lead_data.get('utm_campaign') or '').strip()

    # 1. Insert into SQLite
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute('''
        INSERT INTO leads (submitted_at, name, email, phone, unit, message, page_url, utm_source, utm_campaign, ip)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (submitted_at, name, email, phone, unit, message, page_url, utm_source, utm_campaign, client_ip))
    row_id = cur.lastrowid
    conn.commit()
    conn.close()

    # 2. Append to CSV
    try:
        with open(CSV_PATH, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([submitted_at, name, email, phone, unit, message, page_url, utm_source, utm_campaign, client_ip])
    except Exception as e:
        print(f"[server.py] Warning appending to CSV: {e}")

    return {
        'id': row_id,
        'submitted_at': submitted_at,
        'name': name,
        'email': email,
        'phone': phone,
        'unit': unit,
        'message': message,
        'page_url': page_url,
        'utm_source': utm_source,
        'utm_campaign': utm_campaign,
        'ip': client_ip
    }

def get_leads():
    leads = []
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute('SELECT * FROM leads ORDER BY id DESC')
        rows = cur.fetchall()
        for r in rows:
            lead_dict = dict(r)
            if lead_dict.get('unit') == 'Deal from Era':
                lead_dict['unit'] = 'Home Page / Book a Call'
            leads.append(lead_dict)
        conn.close()
    except Exception as e:
        print(f"[server.py] SQLite read error: {e}")

    # Fallback to CSV if DB empty
    if not leads and os.path.exists(CSV_PATH):
        try:
            with open(CSV_PATH, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    if row.get('unit') == 'Deal from Era':
                        row['unit'] = 'Home Page / Book a Call'
                    leads.append(row)
            leads.reverse()
        except Exception as e:
            print(f"[server.py] CSV read error: {e}")

    return leads

class PinkOaksHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Prevent aggressive browser caching of JS/CSS during local development
        if self.path.endswith('.js') or self.path.endswith('.css') or self.path.endswith('.html'):
            self.send_header('Cache-Control', 'no-cache, must-revalidate')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.lstrip('/')

        # Handle API calls for leads
        if path in ('api-leads.php', 'api/leads', 'api-leads'):
            leads = get_leads()
            payload = json.dumps({
                'success': True,
                'storage': 'sqlite',
                'count': len(leads),
                'leads': leads
            }).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(payload)))
        # Handle schema.sql download
        if path in ('schema.sql', 'database.sql'):
            sql_file = os.path.join(ROOT_DIR, 'schema.sql')
            if os.path.exists(sql_file):
                with open(sql_file, 'rb') as f:
                    content = f.read()
                self.send_response(200)
                self.send_header('Content-Type', 'application/sql; charset=utf-8')
                self.send_header('Content-Length', str(len(content)))
                self.end_headers()
                self.wfile.write(content)
                return

        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.lstrip('/')

        if path in ('form-handler.php', 'api-leads.php', 'api/leads', 'form-handler'):
            content_length = int(self.headers.get('Content-Length', 0))
            body_bytes = self.rfile.read(content_length)
            
            data = {}
            content_type = self.headers.get('Content-Type', '')
            if 'application/json' in content_type:
                try:
                    data = json.loads(body_bytes.decode('utf-8'))
                except Exception:
                    data = {}
            else:
                try:
                    parsed_form = urllib.parse.parse_qs(body_bytes.decode('utf-8'))
                    for k, v in parsed_form.items():
                        data[k] = v[0] if len(v) == 1 else v
                except Exception:
                    data = {}

            # Spam trap check
            if data.get('po_website'):
                res = json.dumps({'success': True, 'message': 'Thank you.'}).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(res)))
                self.end_headers()
                self.wfile.write(res)
                return

            client_ip = self.client_address[0] if self.client_address else '127.0.0.1'
            saved = save_lead(data, client_ip)
            print(f"[server.py] Saved Lead #{saved['id']}: {saved['name']} | {saved['phone']} | Unit: {saved['unit']}")

            res = json.dumps({
                'success': True,
                'ok': True,
                'message': 'Lead received and recorded successfully.',
                'lead': saved
            }).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(res)))
            self.end_headers()
            self.wfile.write(res)
            return

        self.send_response(404)
        self.end_headers()

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.lstrip('/')

        if path in ('api-leads.php', 'api/leads'):
            try:
                conn = sqlite3.connect(DB_PATH)
                conn.execute('DELETE FROM leads')
                conn.commit()
                conn.close()
                with open(CSV_PATH, 'w', newline='', encoding='utf-8') as f:
                    writer = csv.writer(f)
                    writer.writerow(['submitted_at', 'name', 'email', 'phone', 'unit', 'message', 'page', 'utm_source', 'utm_campaign', 'ip'])
                res = json.dumps({'success': True, 'message': 'All leads cleared'}).encode('utf-8')
                self.send_response(200)
            except Exception as e:
                res = json.dumps({'success': False, 'error': str(e)}).encode('utf-8')
                self.send_response(500)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(res)))
            self.end_headers()
            self.wfile.write(res)
            return

        self.send_response(404)
        self.end_headers()

if __name__ == '__main__':
    os.chdir(ROOT_DIR)
    init_db()
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, PinkOaksHandler)
    print(f"\n=======================================================")
    print(f"  Pink Oaks Residences — Active Dev Server")
    print(f"  Serving: http://localhost:{PORT}")
    print(f"  Admin:   http://localhost:{PORT}/admin.html")
    print(f"  SQL DB:  SQLite active ({DB_PATH})")
    print(f"  Schema:  MySQL / MariaDB schema ready ({os.path.join(ROOT_DIR, 'schema.sql')})")
    print(f"  CSV:     {CSV_PATH}")
    print(f"=======================================================\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        httpd.server_close()
