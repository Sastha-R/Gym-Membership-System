# SCULPT GYM Membership Management System

## Project Description

SCULPT GYM is a browser-based gym membership management system with separate owner and customer dashboards. Owners can manage plans and monitor members, while customers can register, purchase plans, renew expired memberships, and track membership status.

The application uses JSON Server as a lightweight REST API and stores authentication state in browser local storage.

## Features

### Owner Dashboard

- View total members and plans
- View active and expired member counts
- Add and edit membership plans
- Activate or deactivate plans
- Soft-delete and restore plans
- Search and filter plans by status, duration, age group, and deleted state
- Search and filter members
- View paginated member records
- Track membership expiry dates

### Customer Dashboard

- Register and log in as a customer
- View the current plan, expiry date, and remaining days
- Browse, search, and filter available plans
- Purchase a membership
- Renew an expired membership

### General Features

- Owner and customer role-based access
- Light and dark themes
- Responsive interface
- Client-side form validation
- Confirmation and notification dialogs
- Login session stored in local storage

## Technologies Used


   HTML5 - Page structure 
   CSS3 - Custom styling and themes 
   JavaScript - Application logic 
   jQuery  - Login and registration handling 
   Bootstrap  - Responsive layout and components 
   Bootstrap Icons - Interface icons 
   SweetAlert2 - Alerts and confirmation dialogs 
   JSON Server - REST API and JSON database 
   Local Storage - Login session and theme preference 

## Project Structure

```text
GYM_Membership_system/
|-- Assets/
|   |-- dark_background.png
|   `-- gym_index_background.webp
|-- css/
|   `-- style.css
|-- data/
|   `-- db.json
|-- Pages/
|   |-- index.html
|   |-- owner-dashboard.html
|   `-- customer-dashboard.html
|-- script/
|   |-- common.js
|   |-- customer.js
|   |-- login.js
|   |-- owner.js
|   `-- register.js
`-- README.md
```

## Prerequisites

- A modern web browser
- [Node.js](https://nodejs.org/) and npm
- JSON Server, installed through npm or executed with `npx`
- Double-click `index.html` to open it in your web browser.
- Internet access for CDN-hosted libraries


## How to Run the Project

### 1. Start the backend

Run this command from the project root:

```bash
npx json-server data/db.json --port 3000
```

The API will be available at `http://localhost:3000`.

### 2. Start the frontend

- Double-click `index.html` to open it in your web browser.


## Usage Instructions

### Customer Registration

1. Open the landing page.
2. Select **Register**.
3. Enter a name, email address, 10-digit phone number, and password.
4. Submit the form.
5. Log in using the newly registered credentials.

Newly registered users are assigned the `customer` role.

### Customer Membership

1. Log in as a customer.
2. Browse or filter the available plans.
3. Select **Buy** to purchase a plan.
4. When the membership expires, select **Renew**.
5. Use the summary cards to view the current plan, expiry date, and remaining days.

Customers with active memberships cannot purchase another plan until the current membership expires.

### Owner Management

1. Log in using an owner account.
      - email: hector@gmail.com
      - password: 123456789@hH
2. Use **Add Plan** to create a membership plan.
3. Search or filter plans from the plans section.
4. Edit, delete, or restore plans using the available actions.
5. Review member information and membership status in the members section.


## Configuration

The API base URL is configured in `script/common.js`:

```javascript
const API_URL = "http://localhost:3000";
```

JSON Server must use port `3000` unless the source configuration is changed.

The theme and logged-in user are stored in browser local storage under `theme` and `loggedInUser`. No environment variables or separate configuration files are present.

## API and Backend Information

The project uses JSON Server with `data/db.json`.

### Resources

 Resource,Endpoint and Description 

 Users -> `/users`  Owner and customer accounts 
 Plans -> `/plans`  Membership plans 
 Memberships -> `/memberships`  Customer membership records 

### Data Relationships

- A membership references a user through `userId`.
- A membership references a plan through `planId`.
- Membership status is calculated from `expiryDate`.
- Plans use `isDeleted` for soft deletion.

## Default Login Credentials

The database includes the following owner account:

 Role:Owner 
 Email:`hector@gmail.com`
 Password: `123456789@hH`

Additional customer accounts are present in `data/db.json`.




