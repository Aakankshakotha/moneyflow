# Sankey Diagram Setup Example

## Quick Start Guide for Money Flow Chart

### 🎯 NEW SIMPLIFIED APPROACH!

You **DON'T need to create separate expense accounts** for each category!
Just use **categories** in your transactions instead.

---

### 1️⃣ Create Your Accounts (Simplified)

Go to **Accounts** page and create these:

#### Income Accounts (Type: income)

| Account Name   | Type   | Balance |
| -------------- | ------ | ------- |
| Salary         | income | $0      |
| Freelance Work | income | $0      |

#### Asset Accounts (Type: asset)

**These are your REAL accounts where money lives**
| Account Name | Type | Balance |
|--------------|------|---------|
| Checking Account | asset | $1,000 |
| Savings Account | asset | $5,000 |
| Cash Wallet | asset | $200 |

#### Expense Accounts (Optional)

**You can create ONE generic expense account or skip this entirely**
| Account Name | Type | Balance |
|--------------|------|---------|
| General Expenses | expense | $0 |

That's it! Only 3-6 accounts needed total.

---

### 2️⃣ Record Transactions with Categories

Go to **Transactions** page and add these:

#### Income Transactions (Money Coming In)

**Get Paid - Salary**

- From Account: `Salary` (income)
- To Account: `Checking Account` (asset)
- Amount: `$5,000`
- **Category**: `income-salary` ✨
- Description: "Monthly paycheck"

**Freelance Payment**

- From Account: `Freelance Work` (income)
- To Account: `Checking Account` (asset)
- Amount: `$1,200`
- **Category**: `income-freelance` ✨
- Description: "Web design project"

#### Expense Transactions (Money Going Out)

**The key: You can use ANY expense account (or even the same one) and differentiate by CATEGORY!**

**Pay Rent**

- From Account: `Checking Account` (asset)
- To Account: `General Expenses` (expense) ← Same account for all!
- Amount: `$1,500`
- **Category**: `home-rent` ✨ ← This determines the Sankey flow!
- Description: "Monthly rent"

**Buy Groceries**

- From Account: `Checking Account` (asset)
- To Account: `General Expenses` (expense) ← Same account!
- Amount: `$250`
- **Category**: `food-groceries` ✨ ← Different category!
- Description: "Whole Foods shopping"

**Dinner Out**

- From Account: `Cash Wallet` (asset)
- To Account: `General Expenses` (expense) ← Same account!
- Amount: `$85`
- **Category**: `food-dining` ✨ ← Different category!
- Description: "Italian restaurant"

**Fill Gas Tank**

- From Account: `Checking Account` (asset)
- To Account: `General Expenses` (expense)
- Amount: `$60`
- **Category**: `transport-fuel` ✨
- Description: "Shell gas station"

**Pay Electric Bill**

- From Account: `Checking Account` (asset)
- To Account: `General Expenses` (expense)
- Amount: `$120`
- **Category**: `utilities-electricity` ✨
- Description: "Monthly electric bill"

**Movie Tickets**

- From Account: `Checking Account` (asset)
- To Account: `General Expenses` (expense)
- Amount: `$45`
- **Category**: `entertainment-movies` ✨
- Description: "Movie night"

---

### 3️⃣ What You'll See in the Sankey Diagram

After adding these transactions, your **Money Flow Chart** will display:

#### LEFT COLUMN (Green - Income Sources)

```
💰 Salary ($5,000)
💰 Freelance ($1,200)
```

#### MIDDLE COLUMN (Blue - Your Real Accounts)

```
Checking Account
Cash Wallet
Savings Account
```

#### RIGHT COLUMN (Colored - Spending Categories)

```
🏠 Rent ($1,500) - Blue
🛒 Groceries ($250) - Green
🍽️ Dining Out ($85) - Red
⛽ Fuel ($60) - Orange
⚡ Electricity ($120) - Purple
🎬 Movies ($45) - Pink
```

#### The Flow Visualization

```
Salary ──────────┐
                 ├─→ Checking Account ──→ 🏠 Rent
Freelance ───────┘           │
                             ├─→ 🛒 Groceries
                             ├─→ ⛽ Fuel
                             ├─→ ⚡ Electricity
                             └─→ 🎬 Movies

Cash Wallet ─────────────────→ 🍽️ Dining Out
```

**Notice**: All expenses went to the same "General Expenses" account, but the Sankey shows them separated by **category**!

---

### 4️⃣ Important Rules (SIMPLIFIED!)

✅ **DO**: Create transactions from **Income account** → **Asset account**
✅ **DO**: Create transactions from **Asset account** → **Any expense account**
✅ **DO**: Always add a **category** to your expense transactions
❌ **DON'T**: Forget to add categories (they determine what shows in the Sankey!)
❌ **DON'T**: Create income → expense directly (money should go through your real accounts first)

---

### 5️⃣ Categories (Optional but Recommended)

Categories help group similar expenses together. Available categories include:

**Income Categories:**

- income-salary, income-freelance, income-investment

**Home Categories:**

- home-rent, home-mortgage, home-maintenance, home-furnishing

**Food Categories:**

- food-groceries, food-dining, food-coffee

**Transportation Categories:**

- transport-fuel, transport-public, transport-car, transport-maintenance

**Healthcare Categories:**

- health-insurance, health-doctor, health-pharmacy, health-fitness

**Entertainment Categories:**

- entertainment-streaming, entertainment-movies, entertainment-hobbies, entertainment-travel

**Utilities Categories:**

- utilities-electricity, utilities-water, utilities-internet, utilities-phone

**Personal Categories:**

- personal-clothing, personal-beauty, personal-education, personal-gifts

---

### 6️⃣ Tips for Best Results

1. **Use meaningful account names** - Instead of "Account 1", use "Checking", "Groceries", etc.
2. **Add categories when possible** - Makes the chart more colorful and informative
3. **Keep expense accounts specific** - "Groceries" and "Restaurants" instead of just "Food"
4. **Regular updates** - Add transactions regularly to see your money flow over time

---

## 🎯 Quick Test (Simplified Version)

To test if it's working:

1. **Create just 3 accounts:**
   - "My Salary" (type: **income**)
   - "My Checking" (type: **asset**)
   - "Expenses" (type: **expense**)

2. **Add 3 transactions:**

   **Transaction 1:**
   - From: "My Salary" → To: "My Checking"
   - Amount: $2000
   - Category: "income-salary"

   **Transaction 2:**
   - From: "My Checking" → To: "Expenses"
   - Amount: $500
   - Category: **"food-groceries"** ← This is the key!

   **Transaction 3:**
   - From: "My Checking" → To: "Expenses"
   - Amount: $300
   - Category: **"food-dining"** ← Different category!

3. **Go to Dashboard**

4. **You should see:**
   ```
   My Salary → My Checking ──→ 🛒 Groceries ($500)
                          └──→ 🍽️ Dining Out ($300)
   ```

Notice both expenses went to the same "Expenses" account, but they show as separate categories in the Sankey!

---

## 💡 Why This Is Better

**Old way:**

- Create 50+ expense accounts (Groceries, Rent, Gas, Coffee, Movies, etc.)
- Hard to manage
- Cluttered account list

**New way:**

- Create 3-5 real accounts (Checking, Savings, Credit Card, etc.)
- Use **categories** in transactions
- Clean and simple!

**The category field does the heavy lifting!** ✨

Good luck! 🚀
