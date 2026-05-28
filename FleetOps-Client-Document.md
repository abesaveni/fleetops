# FleetOps — Platform Overview & Flow Guide

**Version:** 1.0  
**Date:** May 2026  
**Live URL:** https://fleetops-tawny.vercel.app

---

## Table of Contents

1. [What is FleetOps?](#1-what-is-fleetops)
2. [User Roles](#2-user-roles)
3. [Getting Started — Organization Registration](#3-getting-started--organization-registration)
4. [Login Flow](#4-login-flow)
5. [Organization Dashboard](#5-organization-dashboard)
6. [Fleet Management](#6-fleet-management)
7. [User Management](#7-user-management)
8. [Reports & Exports](#8-reports--exports)
9. [Billing & Plans](#9-billing--plans)
10. [Settings & Account](#10-settings--account)
11. [Super Admin Panel](#11-super-admin-panel)
12. [Plan Comparison](#12-plan-comparison)
13. [Data & Security](#13-data--security)

---

## 1. What is FleetOps?

FleetOps is a **multi-tenant, cloud-based fleet management platform** designed for bus transit agencies and fleet operators. It gives organizations a real-time view of every bus in their fleet — what's running, what's down, what's being repaired, and what's waiting for sign-off.

### Key Capabilities

| Capability | Description |
|---|---|
| Real-time fleet status | Live tracking of every bus across 4 operational states |
| Team access control | Role-based access — Admins vs. Viewers |
| Reports | Instant PDF and CSV fleet reports, email delivery |
| Billing | Subscription-based plans via Braintree payments |
| Multi-organization | Each organization operates in a fully isolated environment |
| Super Admin | Platform-wide oversight of all organizations and revenue |

---

## 2. User Roles

FleetOps has three distinct user roles, each with different access levels.

### 2.1 Super Admin
- **Who:** The platform owner (FleetOps operator)
- **Access:** Full platform visibility — all organizations, all revenue, all billing data
- **Cannot:** Access individual organization fleet data directly

### 2.2 Organization Admin
- **Who:** The person who registered the organization (or was promoted to Admin)
- **Access:** Everything within their organization
  - Add, edit, delete buses
  - Add and manage team members
  - Update bus statuses
  - View all reports
  - Manage billing and subscription
  - Delete the organization

### 2.3 Organization User (Viewer)
- **Who:** Team members added by the Organization Admin
- **Access:** Full fleet operations — add, edit, delete buses, update statuses, view reports
- **Cannot:** Add or remove other users, manage billing, delete the organization

### Role Summary Table

| Feature | Super Admin | Org Admin | Org User |
|---|:---:|:---:|:---:|
| View fleet | — | ✅ | ✅ |
| Add / edit / delete buses | — | ✅ | ✅ |
| Update bus status | — | ✅ | ✅ |
| Export reports (PDF/CSV) | — | ✅ | ✅ |
| Add / manage users | — | ✅ | ❌ |
| Manage billing | — | ✅ | ❌ |
| Delete organization | — | ✅ | ❌ |
| View all organizations | ✅ | ❌ | ❌ |
| View platform revenue | ✅ | ❌ | ❌ |
| Override org plans | ✅ | ❌ | ❌ |

---

## 3. Getting Started — Organization Registration

New organizations self-register at `/signup`. The process takes under 2 minutes.

### Step 1 — Create Your Account
Fill in:
- First Name, Last Name
- Work Email address
- Password (minimum 8 characters)

### Step 2 — Set Up Your Organization
Fill in:
- Organization Name
- State (U.S.)
- Approximate fleet size
- Phone number (optional)

### What Happens After Registration
1. A new organization account is created on the **Starter (Free) plan**
2. You are automatically signed in
3. You land directly on your **Fleet Overview dashboard**
4. Your organization starts with a **5-bus free limit**

> **Note:** No credit card is required to start. The free plan includes up to 5 buses.

---

## 4. Login Flow

Returning users sign in at `/login`.

1. Enter email and password
2. The system reads your role from your secure session token
3. **Organization users** → redirected to `/dashboard` (Fleet Overview)
4. **Super Admin** → redirected to `/super-admin/dashboard` (Platform Overview)
5. Inactive accounts → redirected to `/no-access` page

> Passwords are managed by Supabase Auth with industry-standard encryption. FleetOps never stores plain-text passwords.

---

## 5. Organization Dashboard

URL: `/dashboard`

The dashboard gives a real-time snapshot of your entire fleet.

### What You See

**Top Stats Bar**
| Card | Description |
|---|---|
| Total Buses | Total buses registered in your organization |
| In Service | Buses currently operational |
| Out of Service | Buses that need attention or repair |
| Outfitting | Buses being commissioned / fitted out |
| Pending | Buses awaiting sign-off before entering service |

**Fleet Split** — Visual pie/bar showing the proportion of each status across your fleet.

**Status Breakdown** — Counts and percentages for each status with color-coded indicators.

**Needs Attention** — Highlights buses that are Out of Service, helping prioritize repair work.

**Fleet Health Score** — A percentage score based on what proportion of your fleet is operational.

**Recent Activity** — Latest status changes across your fleet.

---

## 6. Fleet Management

### 6.1 All Buses — `/buses`

A searchable, filterable table of every bus in your fleet.

**Filter tabs:** All · In Service · Out of Service · Under Repair · Pending

**Search:** By Bus ID, Bus System, or Location

**Actions available from this screen:**
- **+ Add Bus** — Opens the Add Bus form
- **Edit** — Opens the edit form for any bus
- **Export CSV** — Download full fleet data as a spreadsheet
- **Export PDF** — Generate a formatted PDF fleet report
- **Email Report** — Send the current view to any email address

### 6.2 Bus Status Types

| Status | Color | Meaning |
|---|---|---|
| **In Service** | 🟢 Green | Bus is fully operational and running routes |
| **Out of Service** | 🔴 Red | Bus is down — needs repair or attention |
| **Outfitting** | 🟡 Yellow | Bus is being commissioned, fitted, or customized |
| **Pending** | 🔵 Blue | Bus is waiting for approval before entering service |

### 6.3 Adding a Bus — `/buses/new`

Click **+ Add Bus** from the sidebar or fleet list.

**Required fields:**
- Bus ID (unique identifier for your fleet)

**Optional fields:**
- Bus Status (defaults to In Service)
- Bus System / Route
- Location / Depot
- Bus Age
- Out of Service Date
- Back in Service Date
- Estimated Repair Time
- Problem Description
- Maintenance Comments

> The system enforces your plan's bus limit. On the free Starter plan, you can add up to 5 buses. Upgrading unlocks more.

### 6.4 Bus Detail Page — `/buses/[id]`

Click any bus row to open its full detail page. From here you can:

- **Update Status** — Change the bus's operational status instantly via a modal picker
- **Edit** — Update any field on the bus record
- **Delete** — Permanently remove the bus from your fleet
- **Notify** — Send a status notification email to any address

### 6.5 Fleet Board — `/fleet-board`

A visual board layout showing buses grouped and sorted by status — useful for a quick at-a-glance operational overview.

---

## 7. User Management

URL: `/admin/users` (Admin only)

Organization Admins can build their team from this screen.

### Adding a New User
1. Click **Add User**
2. Enter the user's email address
3. A secure password is auto-generated (can be regenerated)
4. Select role: **Viewer** or **Admin**
5. Click **Create User**
6. A credentials card is shown — copy and share securely with the new user

> The new user can sign in immediately using the provided credentials. Passwords should be changed after first login.

### Managing Existing Users
- **Change Role** — Promote a Viewer to Admin or demote an Admin to Viewer using the dropdown in the user table
- **Deactivate / Activate** — Suspend a user's access without deleting their account. Deactivated users cannot log in.

> You cannot deactivate or change the role of your own account.

---

## 8. Reports & Exports

### Fleet Report — `/admin/invoice`

Generates a full fleet report for the organization showing all buses, their statuses, systems, and locations.

### Export Options Available Throughout the App

| Format | How to access | Contents |
|---|---|---|
| **PDF** | Export PDF button on `/buses` | Formatted fleet report with all visible buses |
| **CSV** | Export CSV button on `/buses` | Raw data spreadsheet of all visible buses |
| **Email** | Email Report button on `/buses` | Sends the current filtered view to any email |

> Exports respect the current filter — if you filter to "Out of Service" buses only, the export will contain only those buses.

---

## 9. Billing & Plans

URL: `/upgrade`

### Available Plans

| Plan | Price | Bus Limit | Best For |
|---|---|---|---|
| **Starter** | Free | 5 buses | Small operators getting started |
| **Pro** | $49/month or $499/year | 50 buses | Growing transit agencies |
| **Business** | $149/month or $1,499/year | 250 buses | Large operators |
| **Enterprise** | Custom pricing | Unlimited | City-scale transit authorities |

> Yearly plans save approximately 15% compared to monthly billing.

### Upgrading Your Plan
1. Go to **Settings → Upgrade Plan** or visit `/upgrade`
2. Choose **Monthly** or **Yearly** billing
3. Select your plan
4. Enter your card details in the secure Braintree payment form
5. Click **Subscribe**
6. Your plan activates immediately — bus limit is updated in real time

### Payment Security
- Payments are processed by **Braintree** (a PayPal company)
- Card data never touches FleetOps servers — it is tokenized by Braintree's Drop-in UI
- Transactions are submitted for settlement automatically

### Reaching Your Bus Limit
When you reach your plan's bus limit:
- A red **Fleet Capacity** bar appears in the sidebar
- Attempting to add a bus shows an upgrade prompt
- A banner links to `/upgrade` to expand your capacity

---

## 10. Settings & Account

URL: `/settings` (Admin only)

### What You Can See
- Organization name
- Your role
- Current plan
- Bus limit

### Account Actions
- **Upgrade Plan** — Links to the upgrade/billing page
- **Manage Users** — Quick link to user management

### Danger Zone — Delete Organization
Organization Admins can permanently delete the organization.

**Process:**
1. Click **Delete Organization**
2. A confirmation prompt appears
3. Type your organization name exactly to confirm
4. Click **Permanently Delete Organization**

> ⚠️ This action is irreversible. All buses, users, and data are permanently deleted.

---

## 11. Super Admin Panel

URL: `/super-admin/dashboard`  
Access: Platform owner only (`abesaveni@gmail.com`)

The Super Admin panel provides full visibility across all organizations on the platform.

### 11.1 Platform Dashboard — `/super-admin/dashboard`

**KPI Cards:**
| Card | Description |
|---|---|
| MRR | Monthly Recurring Revenue across all paying orgs |
| ARR | Annual Recurring Revenue projection |
| Paying Orgs | Number of organizations on paid plans |
| Free Trial | Organizations on the free Starter plan |
| Payment Issues | Organizations with failed payments |
| Total Orgs | All registered organizations |
| Total Buses | All buses across all organizations |
| Out of Service | All OOS buses platform-wide |
| Suspended | Suspended organization accounts |

**Recent Sign-ups** — Latest organizations that registered on the platform.

### 11.2 Organizations — `/super-admin/organizations`

A full table of every organization with:
- Organization name and owner email
- Current plan (color-coded pill)
- Status (Active / Trial / Suspended / Payment Failed)
- Monthly value (MRR contribution)
- Bus count and fleet capacity bar
- Date registered

**Filter tabs:** All · Active · Trial · Paying · Payment Failed

Click any organization to open its full detail page.

### 11.3 Organization Detail — `/super-admin/organizations/[id]`

Full profile of a single organization including:
- Contact details and registration info
- Billing card (plan, billing period, MRR, renewal date, Braintree IDs)
- Fleet capacity bar
- Days to renewal
- **Manual plan override** — Super Admin can change any org's plan, bus limit, or status directly

### 11.4 Billing Dashboard — `/super-admin/billing`

Revenue-focused view with:
- MRR / ARR / Paying customers / Free trial / Payment failed KPIs
- Revenue breakdown chart
- Full table of all paying organizations with billing dates, renewal dates, and plan details
- Days-left chip showing how many days until each org renews

### 11.5 Create Organization — `/super-admin/organizations/new`

Super Admin can manually register an organization on behalf of a client (e.g., for enterprise customers).

---

## 12. Plan Comparison

| Feature | Starter (Free) | Pro | Business | Enterprise |
|---|:---:|:---:|:---:|:---:|
| Bus limit | 5 | 50 | 250 | Unlimited |
| Real-time fleet tracking | ✅ | ✅ | ✅ | ✅ |
| Bus status management | ✅ | ✅ | ✅ | ✅ |
| PDF & CSV reports | ✅ | ✅ | ✅ | ✅ |
| Email reports | ✅ | ✅ | ✅ | ✅ |
| Team members | Up to 2 | Unlimited | Unlimited | Unlimited |
| Priority support | ❌ | ✅ | ✅ | ✅ |
| Fleet analytics | ❌ | ❌ | ✅ | ✅ |
| Custom integrations | ❌ | ❌ | ❌ | ✅ |
| Dedicated account manager | ❌ | ❌ | ❌ | ✅ |
| 24/7 phone + SLA guarantee | ❌ | ❌ | ❌ | ✅ |
| Monthly price | Free | $49 | $149 | Custom |
| Yearly price | Free | $499 | $1,499 | Custom |

---

## 13. Data & Security

### Authentication
- Powered by **Supabase Auth** — industry-standard JWT-based authentication
- Session tokens are stored securely in HTTP-only cookies
- Role and organization data is embedded in the JWT — zero database queries on every page load

### Data Isolation
- Each organization's data is fully isolated at the database level using **Row Level Security (RLS)**
- Organization users can only see and modify their own organization's buses and users
- Super Admin uses a privileged service-role client that bypasses RLS for platform management only

### Payments
- Card processing by **Braintree** (PayPal subsidiary)
- PCI-compliant — card data is never stored on FleetOps servers
- Braintree Drop-in UI handles tokenization client-side

### Infrastructure
- **Frontend + API:** Next.js 14, deployed on **Vercel** (edge network, global CDN)
- **Database:** PostgreSQL via **Supabase** (hosted on AWS us-east-1)
- **Domain:** Custom domain via Vercel

### Backup & Availability
- Supabase provides automatic daily database backups
- Vercel guarantees 99.99% uptime SLA on production deployments

---

## Quick Reference — Key URLs

| Page | URL | Who Can Access |
|---|---|---|
| Registration | `/signup` | Anyone |
| Login | `/login` | Anyone |
| Fleet Overview | `/dashboard` | All org users |
| All Buses | `/buses` | All org users |
| Add Bus | `/buses/new` | All org users |
| Fleet Board | `/fleet-board` | All org users |
| Fleet Report | `/admin/invoice` | All org users |
| Manage Users | `/admin/users` | Org Admins only |
| Upgrade / Billing | `/upgrade` | All org users |
| Settings | `/settings` | Org Admins only |
| SA Dashboard | `/super-admin/dashboard` | Super Admin only |
| SA Organizations | `/super-admin/organizations` | Super Admin only |
| SA Billing | `/super-admin/billing` | Super Admin only |

---

*FleetOps — Built for modern transit operations*  
*Support: abesaveni@gmail.com*
