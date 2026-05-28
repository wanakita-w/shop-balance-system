import { useState } from "react";
import { useTransactions } from "../context/TransactionContext";
import Modal from "./ui/Modal";

const IconCash = () => (
  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const IconTransfer = () => (
  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);

export default function TransactionForm({ isOpen, onClose, transaction = null }) {
  const { addTransaction, editTransaction } = useTransactions();
  const isEditing = transaction !== null;

  const [formData, setFormData] = useState({
    type: transaction?.type || "EXPENSE",
    amount: transaction?.amount || "",
    method: transaction?.method || "CASH",
    category: transaction?.category || "",
    note: transaction?.note || "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const isIncome = formData.type === "INCOME";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleToggle = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.amount || Number(formData.amount) <= 0)
      newErrors.amount = "Enter a valid amount";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setIsLoading(true);
    setSubmitError("");
    try {
      const data = {
        type: formData.type,
        amount: Number(formData.amount),
        method: formData.method,
        category: formData.category || undefined,
        note: formData.note || undefined,
      };
      if (isEditing) {
        await editTransaction(transaction.id, data);
      } else {
        await addTransaction(data);
      }
      onClose();
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Transaction" : "New Transaction"}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Type toggle — sliding pill */}
        <div className="relative flex p-1 bg-gray-100 dark:bg-gray-700/60 rounded-2xl">
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl shadow-sm transition-all duration-300 ease-in-out ${
              isIncome ? "left-1 bg-green-500" : "left-[calc(50%+3px)] bg-red-500"
            }`}
          />
          {[
            { value: "INCOME", label: "Income" },
            { value: "EXPENSE", label: "Expense" },
          ].map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleToggle("type", value)}
              className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors duration-200 active:scale-[0.97] ${
                formData.type === value ? "text-white" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Amount input */}
        <div className={`rounded-3xl px-5 py-6 transition-colors duration-300 ${
          isIncome
            ? "bg-green-50 dark:bg-green-900/20"
            : "bg-red-50 dark:bg-red-900/20"
        }`}>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 text-center mb-3">
            Amount · THB
          </p>
          <div className="flex items-center justify-center gap-1">
            <span className={`text-3xl font-bold transition-colors duration-300 flex-shrink-0 ${
              isIncome ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
            }`}>
              ฿
            </span>
            <input
              name="amount"
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={formData.amount}
              onChange={handleChange}
              autoFocus={!isEditing}
              className={`bg-transparent text-4xl font-bold outline-none placeholder-gray-200 dark:placeholder-gray-700 text-center min-w-0 w-full transition-colors duration-300 ${
                isIncome ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
              }`}
            />
          </div>
          {errors.amount && (
            <p className="text-xs text-red-500 mt-2.5 text-center font-medium">{errors.amount}</p>
          )}
        </div>

        {/* Method */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: "CASH", label: "Cash", icon: <IconCash /> },
            { value: "TRANSFER", label: "Transfer", icon: <IconTransfer /> },
          ].map(({ value, label, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleToggle("method", value)}
              className={`flex items-center justify-center gap-2 py-3 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 active:scale-[0.97] ${
                formData.method === value
                  ? "border-primary bg-primary/5 dark:bg-primary/10 text-primary"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400"
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* Details */}
        <div className="space-y-2">
          <input
            name="category"
            type="text"
            placeholder="Category  (e.g. Food, Labor)"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
          <input
            name="note"
            type="text"
            placeholder="Note  (optional)"
            value={formData.note}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>

        {/* API error */}
        {submitError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl p-3.5">
            <p className="text-sm text-red-600 dark:text-red-400 text-center">{submitError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-[0.97] transition-all duration-150"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`flex-1 py-3 rounded-2xl text-sm font-semibold text-white shadow-sm active:scale-[0.97] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
              isIncome ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Saving...
              </span>
            ) : isEditing ? "Save Changes" : `Add ${isIncome ? "Income" : "Expense"}`}
          </button>
        </div>

      </form>
    </Modal>
  );
}
