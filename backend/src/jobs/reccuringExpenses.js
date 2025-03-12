const { db } = require("../config/firebase");

// 📌 Function to process recurring expenses
const processRecurringExpenses = async () => {
  try {
    console.log("🔄 Running Recurring Expense Job...");

    const usersSnapshot = await db.collection("users").get();

    for (const userDoc of usersSnapshot.docs) {
      const userEmail = userDoc.id;

      // ✅ Get all recurring expenses for the user
      const recurringExpensesSnapshot = await db.collection("users").doc(userEmail)
        .collection("recurring_expenses")
        .get();

      for (const expenseDoc of recurringExpensesSnapshot.docs) {
        const expenseData = expenseDoc.data();
        const { amount, category, description, nextDueDate, repeatInterval } = expenseData;

        if (!nextDueDate) continue;

        const nextMonth = nextDueDate.substring(0, 7); // Format: "YYYY-MM"
        
        // ✅ Check if budget exists for next month
        const budgetRef = db.collection("users").doc(userEmail).collection("budgets").doc(nextMonth);
        const budgetDoc = await budgetRef.get();

        if (!budgetDoc.exists) {
          console.log(`🚨 Skipping ${category} for ${userEmail} (No budget for ${nextMonth})`);
          continue;  // Skip if no budget set
        }

        // ✅ Create the expense for the next month
        const expenseRef = db.collection("users").doc(userEmail).collection("expenses").doc();
        await expenseRef.set({
          id: expenseRef.id,
          amount,
          category,
          description,
          date: `${nextMonth}-01`,
          createdAt: new Date().toISOString()
        });

        console.log(`✅ Added recurring expense: ${category} for ${userEmail} (${nextMonth})`);

        // ✅ Update nextDueDate based on repeatInterval
        let newNextDueDate;
        if (repeatInterval === "monthly") {
          const [year, month] = nextMonth.split("-");
          const newMonth = (parseInt(month, 10) % 12) + 1;
          const newYear = newMonth === 1 ? parseInt(year, 10) + 1 : year;
          newNextDueDate = `${newYear}-${newMonth.toString().padStart(2, "0")}-01`;
        }

        // ✅ Update the nextDueDate in Firestore
        await db.collection("users").doc(userEmail).collection("recurring_expenses").doc(expenseDoc.id).update({
          nextDueDate: newNextDueDate
        });
      }
    }

    console.log("🔄 Recurring Expense Job Complete!");
  } catch (error) {
    console.error("🚨 Recurring Expense Error:", error);
  }
};

module.exports = { processRecurringExpenses };
