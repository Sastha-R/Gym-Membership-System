
CREATE DATABASE SculptGymDB;

USE SculptGymDB;

--TABLES

CREATE TABLE Users
(
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    Phone VARCHAR(15) NOT NULL,
    Password NVARCHAR(255) NOT NULL,
    Role VARCHAR(20) NOT NULL CHECK (Role IN ('owner', 'customer')),
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
);


CREATE TABLE Plans
(
    PlanId INT IDENTITY(1,1) PRIMARY KEY,
    PlanName NVARCHAR(100) NOT NULL,
    Duration INT NOT NULL  CHECK (Duration > 0),
    Price DECIMAL(10,2) NOT NULL CHECK (Price > 0),
    AgeGroup VARCHAR(20) NOT NULL CHECK (AgeGroup IN ('Teen', 'Adult', 'Senior')),
    [Status] VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK ([Status] IN ('Active', 'Inactive')),
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

CREATE TABLE Memberships
(
    MembershipId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    PlanId INT NOT NULL,
    PurchaseDate DATE NOT NULL,
    ExpiryDate DATE NOT NULL,
    CONSTRAINT FK_Memberships_Users
    FOREIGN KEY (UserId) REFERENCES Users(UserId),
    CONSTRAINT FK_Memberships_Plans
    FOREIGN KEY (PlanId) REFERENCES Plans(PlanId),
    CONSTRAINT CK_Memberships_Dates
    CHECK (ExpiryDate >= PurchaseDate)
);
GO

/* Helpful indexes */

CREATE NONCLUSTERED INDEX Users_Role
ON Users([Role]);
GO

CREATE NONCLUSTERED INDEX Plans_Filter
ON Plans ([Status], IsDeleted, AgeGroup);
GO


/*   SAMPLE DATA */

INSERT INTO Users (FullName, Email, Phone, [Password], [Role])
VALUES ('Arjun Kumar', 'arjun.owner@example.com', '9123456701', 'Owner@123', 'owner'), 
     ('Priya Sharma', 'priya@example.com', '9234567802', 'Priya@123', 'customer'),
    ('Rahul Das', 'rahul@example.com', '9345678903','Rahul@123', 'customer'),
    ('Meera Nair', 'meera@example.com', '9456789014','Meera@123', 'customer'),
    ('Kiran Patel', 'kiran@example.com', '9567890125','Kiran@123', 'customer');
GO

INSERT INTO Plans (PlanName, Duration, Price, AgeGroup, [Status], IsDeleted)
VALUES ('Teen Starter', 30, 450.00, 'Teen', 'Active', 0),
    ('Adult Quarterly', 90, 1450.00, 'Adult', 'Active', 0),
    ('Senior Wellness', 30, 550.00, 'Senior', 'Active', 0),
    ('Adult Half-Yearly', 180, 2850.00, 'Adult', 'Active', 0),
    ('Premium Annual', 365, 6500.00, 'Adult', 'Inactive', 0),
    ('Archived Fitness Plan', 60, 900.00, 'Adult', 'Inactive', 1);
GO

INSERT INTO Memberships (UserId, PlanId, PurchaseDate, ExpiryDate)
VALUES (2, 2, '2026-06-01', '2026-08-30'),
    (3, 1, '2026-05-01', '2026-05-31'),
    (4, 4, '2026-06-15', '2026-12-12'),
    (5, 3, '2026-06-20', '2026-07-20');
GO

/*CREATE OPERATION */

-- Create a customer
INSERT INTO Users
    (FullName, Email, Phone, [Password], [Role])
VALUES
    ('Neha Singh', 'neha@example.com', '9678901236','Neha@123', 'customer');
GO

-- Create a plan
INSERT INTO Plans
    (PlanName, Duration, Price, AgeGroup, [Status])
VALUES
    ('Senior Quarterly', 90, 1350.00, 'Senior', 'Active');
GO

-- Purchase a plan
DECLARE @CustomerId INT =
(
    SELECT UserId
    FROM Users
    WHERE Email = 'neha@example.com'
);

DECLARE @SelectedPlanId INT =
(
    SELECT PlanId
    FROM Plans
    WHERE PlanName = 'Senior Quarterly'
);

INSERT INTO Memberships
    (UserId, PlanId, PurchaseDate, ExpiryDate)
SELECT
    @CustomerId,
    @SelectedPlanId,
    GETDATE(),
    DATEADD(DAY, Duration, GETDATE())
FROM Plans
WHERE PlanId = @SelectedPlanId;

/* READ OPERATIONS */

-- Read all customers
SELECT
    UserId,
    FullName,
    Email,
    Phone,
    CreatedAt
FROM Users
WHERE [Role] = 'customer'
ORDER BY FullName;
GO

-- Read available plans
SELECT *
FROM Plans
WHERE [Status] = 'Active'
  AND IsDeleted = 0
ORDER BY Price;
GO


-- Read memberships with customer and plan information
SELECT
    m.MembershipId,
    u.FullName,
    u.Email,
    p.PlanName,
    p.Price,
    m.PurchaseDate,
    m.ExpiryDate,
    CASE
        WHEN m.ExpiryDate >= CAST(GETDATE() AS DATE)
            THEN 'Active'
        ELSE 'Expired'
    END AS MembershipStatus
FROM Memberships AS m
INNER JOIN Users AS u
    ON u.UserId = m.UserId
INNER JOIN Plans AS p
    ON p.PlanId = m.PlanId;
GO

/* UPDATE OPERATIONS */

-- Update a plan
UPDATE Plans
SET
    Price = 1550.00,
    Duration = 95
WHERE PlanName = 'Adult Quarterly';
GO

-- Deactivate a plan
UPDATE Plans
SET [Status] = 'Inactive'
WHERE PlanName = 'Premium Annual';
GO

/* DELETE OPERATIONS */

-- Soft-delete a plan 
UPDATE Plans
SET IsDeleted = 1
WHERE PlanName = 'Premium Annual';
GO

-- Restore a soft-deleted plan
UPDATE Plans
SET IsDeleted = 0
WHERE PlanName = 'Premium Annual';
GO


--FILTER VIEWS

CREATE OR ALTER VIEW ActivePlans_view
AS
SELECT
    PlanId,
    PlanName,
    Duration,
    Price,
    AgeGroup,
    [Status],
    CreatedAt
FROM Plans
WHERE [Status] = 'Active'
  AND IsDeleted = 0;
GO

CREATE OR ALTER VIEW InactivePlans_view
AS
SELECT
    PlanId,
    PlanName,
    Duration,
    Price,
    AgeGroup,
    [Status],
    CreatedAt
FROM Plans
WHERE [Status] = 'Inactive'
  AND IsDeleted = 0;
GO

CREATE OR ALTER VIEW DeletedPlans_view
AS
SELECT
    PlanId,
    PlanName,
    Duration,
    Price,
    AgeGroup,
    [Status],
    CreatedAt
FROM Plans
WHERE IsDeleted = 1;
GO

CREATE OR ALTER VIEW PlansWithDurationType_view
AS
SELECT
    PlanId,
    PlanName,
    Duration,
    Price,
    AgeGroup,
    [Status],
    IsDeleted,
    CASE
        WHEN Duration <= 31 THEN 'Monthly'
        WHEN Duration <= 100 THEN 'Quarterly'
        WHEN Duration <= 190 THEN 'Half-Yearly'
        ELSE 'Yearly'
    END AS DurationType
FROM Plans;
GO



/* USING THE FILTER VIEWS */

-- Active plans
SELECT *
FROM ActivePlans_view;
GO

-- Deleted plans
SELECT *
FROM DeletedPlans_view;
GO

-- Monthly plans
SELECT *
FROM PlansWithDurationType_view
WHERE DurationType = 'Monthly'
  AND IsDeleted = 0;
GO

-- Adult plans
SELECT *
FROM ActivePlans_view
WHERE AgeGroup = 'Adult';
GO


/* DASHBOARD SUMMARY */

SELECT
    (SELECT COUNT(*)
     FROM Users
     WHERE [Role] = 'customer') AS TotalMembers,

    (SELECT COUNT(*)
     FROM Plans
     WHERE IsDeleted = 0) AS TotalPlans;
GO

--SQL Queries:
--1. Display All Records

SELECT *
FROM Plans
WHERE IsDeleted = 0;

SELECT *
FROM Users;

-- 2. Display Active Records

SELECT *
FROM Plans
WHERE [Status] = 'Active'
  AND IsDeleted = 0;

--3. Display Inactive Records
SELECT *
FROM Plans
WHERE [Status] = 'Inactive'
  AND IsDeleted = 0;

--4. Search by Name
SELECT *
FROM Plans
WHERE PlanName LIKE '%Adult%';

SELECT *
FROM Users
WHERE FullName LIKE '%Priya%';

--5. Count Total Records
SELECT COUNT(*) AS TotalPlans
FROM Plans
WHERE IsDeleted = 0;

SELECT COUNT(*) AS TotalCustomers
FROM Users
WHERE [Role] = 'customer';

--6. Count Records by Status
SELECT
    [Status],
    COUNT(*) AS TotalPlans
FROM Plans
WHERE IsDeleted = 0
GROUP BY [Status];

--7. Display Recently Added Records
SELECT *
FROM Plans
ORDER BY CreatedAt DESC;

SELECT *
FROM Users
ORDER BY CreatedAt DESC;

--8. Display Records Within Date Range
SELECT *
FROM Plans
WHERE CreatedAt BETWEEN '2026-06-01' AND '2026-06-30';

--9. Display Top 5 Records
SELECT TOP 5 *
FROM Plans
WHERE IsDeleted = 0
ORDER BY Price DESC;

SELECT TOP 5 *
FROM Users
ORDER BY CreatedAt DESC;

--10. Display Summary Report

SELECT
    (SELECT COUNT(*)
     FROM Users
     WHERE [Role] = 'customer') AS TotalCustomers,

    (SELECT COUNT(*)
     FROM Plans
     WHERE IsDeleted = 0) AS TotalPlans,

    (SELECT COUNT(*)
     FROM Plans
     WHERE [Status] = 'Active'
       AND IsDeleted = 0) AS ActivePlans,

    (SELECT COUNT(*)
     FROM Plans
     WHERE [Status] = 'Inactive'
       AND IsDeleted = 0) AS InactivePlans,

    (SELECT COUNT(*)
     FROM Memberships
     WHERE ExpiryDate >= CAST(GETDATE() AS DATE)) AS ActiveMemberships,

    (SELECT COUNT(*)
     FROM Memberships
     WHERE ExpiryDate < CAST(GETDATE() AS DATE)) AS ExpiredMemberships;

     