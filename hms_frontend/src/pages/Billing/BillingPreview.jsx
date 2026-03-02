import React, { useState, useEffect } from "react";
import {
  Search,
  Pencil,
  Trash,
  X,
  Calendar,
  Loader2,
  Plus,
  Minus,
  ChevronDown,
  AlertCircle,
  DollarSign,
  CheckCircle,
  Clock,
  FileText,
  Receipt,
  CreditCard,
  Eye,
} from "lucide-react";
import { Listbox, Switch } from "@headlessui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../utils/axiosConfig";
import { successToast, errorToast } from "../../components/Toast.jsx";

const BillingPreview = () => {
  // ========== STATE VARIABLES ==========
  const [searchQuery, setSearchQuery] = useState("");
  const originalPatients = [
    { id: "SAH027/384", name: "Joe Darrington" },
    { id: "SA123456", name: "John Doe" },
    { id: "SA789012", name: "Jane Smith" },
  ];
  const [patients, setPatients] = useState(originalPatients);
  const [filteredPatients, setFilteredPatients] = useState(patients);
  const [patientInfo, setPatientInfo] = useState({
    patientName: "",
    patientID: "",
    ageGender: "",
    startDate: "",
    endDate: "",
    dateOfBirth: "",
    address: "",
    roomType: "",
    doctorName: "",
    department: "",
    billingStaff: "",
    billingStaffID: "",
    paymentMode: "",
    paymentType: "",
    paymentStatus: "",
    bedGroup: "",
    bedNumber: "",
  });
  const [staffInfo, setStaffInfo] = useState({ staffName: "", staffID: "" });
  const [fullPatient, setFullPatient] = useState(null);
  const [isInsurance, setIsInsurance] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatingBill, setGeneratingBill] = useState(false);
  const [generatingConsolidateInvoice, setGeneratingConsolidateInvoice] = useState(false);
  const [billingItems, setBillingItems] = useState([]);
  const [treatmentCharges, setTreatmentCharges] = useState([]);
  const [insurances, setInsurances] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  // State for invoice generation type dropdown
  const [invoiceGenerationType, setInvoiceGenerationType] = useState("current");
  
  // State for consolidate invoice
  const [availablePaidInvoices, setAvailablePaidInvoices] = useState([]);
  const [showConsolidateInvoices, setShowConsolidateInvoices] = useState(false);
  const [selectedConsolidateInvoices, setSelectedConsolidateInvoices] = useState([]);
  
  // State for partial payment tracking
  const [patientInvoices, setPatientInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);

  // State for selected partial invoices to pay
  const [selectedPartialInvoices, setSelectedPartialInvoices] = useState([]);
  
  // Track if we're paying a pending invoice in Full Payment mode
  const [payPendingInvoice, setPayPendingInvoice] = useState(false);
  const [pendingInvoiceToPay, setPendingInvoiceToPay] = useState(null);
  
  // Track if we're paying selected partial invoices
  const [paySelectedPartialInvoices, setPaySelectedPartialInvoices] = useState(false);

  // State for manual payment and invoice generation
  const [manualPaymentData, setManualPaymentData] = useState({
    amount: "",
    paymentMethod: "Cash",
    transactionId: "",
    remarks: "",
    generateInvoice: true,
  });

  // Charges from charges table for dropdown
  const [chargesList, setChargesList] = useState([]);
  const [loadingCharges, setLoadingCharges] = useState(false);
  
  // Partial Payment Fields for NEW invoice (ONLY in current invoice tab)
  const [partialPaymentData, setPartialPaymentData] = useState({
    paidAmount: "",
    dueDate: "",
    remarks: "",
  });

  // Add Partial Payment Data for EXISTING invoice
  const [addPaymentData, setAddPaymentData] = useState({
    amountPaid: "",
    paymentMethod: "Cash",
    transactionId: "",
    remarks: "",
    generateInvoice: false,
  });

  // Payment Summary State
  const [paymentSummary, setPaymentSummary] = useState({
    totalPaid: 0,
    totalPending: 0,
    paymentHistory: [],
    pendingInvoices: [],
  });
  
  // Tax Configuration State - Will be calculated from items
  const [taxConfig, setTaxConfig] = useState({
    effectiveTaxRate: 0,
    cgstRate: 0,
    sgstRate: 0,
  });

  // Discount configuration for each billing item
  const [discountConfig, setDiscountConfig] = useState({
    totalDiscountPercent: 0,
    totalDiscountAmount: 0,
  });

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({
    paymentMode: "",
    paymentType: "",
    paymentStatus: ""
  });

  const emptyModal = {
    provider: "",
    policyNum: "",
    validFrom: "",
    validTo: "",
    policyCard: "",
  };
  const [modalData, setModalData] = useState(emptyModal);
  const [editingIndex, setEditingIndex] = useState(null);
  
  // Customizable Payment Modes
  const paymentModes = [
    "Cash",
    "Credit Card",
    "Debit Card",
    "UPI",
    "Bank Transfer",
    "Insurance Claim",
  ];
  
  // Payment Types - Full list includes Partial Payment for current invoice tab
  const paymentTypes = [
    "Full Payment",
    "Partial Payment",
    "Insurance",
    "Credit",
    "Consolidate",
  ];
  
  const paymentStatuses = ["Paid", "Pending", "Overdue", "Refunded", "Unpaid"];
  const providers = [
    "Aetna",
    "Blue Cross Blue Shield",
    "Cigna",
    "UnitedHealthcare",
    "Kaiser Permanente",
  ];

  // Invoice Generation Type Options
  const invoiceGenerationOptions = [
    { value: "current", label: "Current Invoice" },
    { value: "consolidate", label: "Consolidate Invoice" },
  ];

  // ========== USE EFFECTS ==========
  useEffect(() => {
    fetchPatients();
    fetchStaffInfo();
    fetchTaxConfiguration();
    fetchCharges();
  }, []);

  useEffect(() => {
    if (staffInfo.staffName) {
      setPatientInfo((prev) => ({
        ...prev,
        billingStaff: staffInfo.staffName,
        billingStaffID: staffInfo.staffID,
      }));
    }
  }, [staffInfo]);

  useEffect(() => {
    if (fullPatient) {
      const ageGender = `${fullPatient.age || ""}/${fullPatient.gender || ""}`;
      const startDate = fullPatient.admission_date || "";
      const endDate = fullPatient.discharge_date || "";
      const dob = fullPatient.date_of_birth || "";
      setPatientInfo((prev) => ({
        ...prev,
        patientName: fullPatient.full_name || prev.patientName,
        patientID: fullPatient.patient_unique_id || prev.patientID,
        ageGender: ageGender,
        startDate: startDate,
        endDate: endDate,
        dateOfBirth: dob,
        address: fullPatient.address || prev.address,
        roomType: fullPatient.room_number || prev.roomType,
        doctorName: fullPatient.staff__full_name || prev.doctorName,
        department: fullPatient.department__name || prev.department,
        bedGroup: fullPatient.bed_group || prev.bedGroup,
        bedNumber: fullPatient.bed_number || prev.bedNumber,
      }));
      if (fullPatient.patient_unique_id) {
        fetchInsurances(fullPatient.patient_unique_id);
      }
    }
  }, [fullPatient]);

  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    setFilteredPatients(
      patients.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.id.toLowerCase().includes(lowerQuery)
      )
    );
  }, [searchQuery, patients]);

  useEffect(() => {
    if (patientInfo.patientID) {
      fetchPatientInvoices(patientInfo.patientID);
      fetchPaymentSummary(patientInfo.patientID);
      fetchAvailablePaidInvoices(patientInfo.patientID);
      
      setPartialPaymentData({
        paidAmount: "",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        remarks: "",
      });
      
      // Reset selected partial invoices when patient changes
      setSelectedPartialInvoices([]);
    }
  }, [patientInfo.patientID]);

  // Update effective tax rate when billing items change
  useEffect(() => {
    calculateEffectiveTaxRate();
  }, [billingItems]);

  // ========== API FUNCTIONS ==========
  const fetchTaxConfiguration = async () => {
    try {
      const response = await api.get("/settings/tax-configuration");
      // Just store for reference, we'll calculate effective rate from items
      console.log("Tax configuration loaded:", response.data);
    } catch (error) {
      console.log("Using default tax configuration");
    }
  };

  const updateTreatmentCharge = async (chargeId, payload) => {
    try {
      await api.put(`/hospital-billing/treatment-charges/${chargeId}`, payload);
    } catch (err) {
      console.error("Failed to update treatment charge:", err);
      errorToast("Failed to update treatment charge");
    }
  };

  const deleteTreatmentCharge = async (chargeId) => {
    try {
      await api.delete(`/hospital-billing/treatment-charges/${chargeId}`);
    } catch (err) {
      console.error("Failed to delete treatment charge:", err);
      errorToast("Failed to delete treatment charge");
      throw err;
    }
  };

  const fetchCharges = async () => {
    try {
      setLoadingCharges(true);
      const res = await api.get("/charges/");
      
      let chargesData = [];
      if (Array.isArray(res.data)) {
        chargesData = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        chargesData = res.data.data;
      } else if (res.data && res.data.success === true && Array.isArray(res.data.data)) {
        chargesData = res.data.data;
      }
      
      setChargesList(chargesData);
    } catch (err) {
      console.error("Failed to load charges:", err);
      errorToast("Failed to load charges list");
    } finally {
      setLoadingCharges(false);
    }
  };

  const fetchPatients = async () => {
    try {
      let patientsData = [];
      try {
        const res = await api.get("/patients/");
        if (Array.isArray(res.data)) {
          patientsData = res.data;
        } else if (res.data && Array.isArray(res.data.results)) {
          patientsData = res.data.results;
        } else if (res.data && Array.isArray(res.data.data)) {
          patientsData = res.data.data;
        } else if (res.data && Array.isArray(res.data.patients)) {
          patientsData = res.data.patients;
        } else if (res.data && typeof res.data === "object") {
          patientsData = [res.data];
        }
      } catch (listError) {
        console.log("List endpoint failed, trying alternatives...");
        const testPatientIds = ["SAH027/384", "SA123456", "SA789012"];
        for (const patientId of testPatientIds) {
          try {
            const patientRes = await api.get(`/patients/${patientId}`);
            patientsData.push(patientRes.data);
          } catch (patientError) {
            console.log(`Could not fetch patient ${patientId}`);
          }
        }
      }
    
      if (patientsData.length === 0) {
        setPatients(originalPatients);
        setFilteredPatients(originalPatients);
        return;
      }
    
      const mappedPatients = patientsData.map((p) => ({
        id: p.patient_unique_id || p.unique_id || p.id || "N/A",
        name: p.full_name || p.name || p.patient_name || "Unknown Patient",
        internalId: p.id,
      }));
    
      setPatients(mappedPatients);
      setFilteredPatients(mappedPatients);
    } catch (err) {
      console.error("Failed to load patients:", err);
      errorToast("Failed to load patients list. Using demo data.");
      setPatients(originalPatients);
      setFilteredPatients(originalPatients);
    }
  };

  const fetchStaffInfo = async () => {
    try {
      const res = await api.get("/profile/me/");
      setStaffInfo({
        staffName: res.data.profile.full_name || "Unknown Staff",
        staffID: res.data.profile.employee_id || "N/A",
      });
    } catch (err) {
      console.error("Failed to load staff info:", err);
      setStaffInfo({ staffName: "Unknown Staff", staffID: "N/A" });
    }
  };

  const fetchPatientDetails = async (uniqueId) => {
    try {
      const res = await api.get(`/patients/${uniqueId}`);
      const patientData = res.data.data || res.data.patient || res.data;
      setFullPatient(patientData);
    
      await fetchPendingTreatmentCharges(patientData.patient_unique_id);
      successToast(
        `Patient ${
          patientData.full_name || patientData.name
        } details loaded successfully`
      );
    } catch (err) {
      console.error("Failed to load patient details:", err);
      errorToast("Failed to load patient details");
    }
  };

 const fetchPendingTreatmentCharges = async (patientUniqueId) => {
  try {
    const res = await api.get(
      `/hospital-billing/patient/${patientUniqueId}/treatment-charges`
    );

    const pendingCharges = res.data?.charges || [];
    setTreatmentCharges(pendingCharges);

    const treatmentChargesItems = pendingCharges.map((charge, idx) => ({
      chargeId: charge.id,
      sNo: (idx + 1).toString().padStart(2, "0"),
      description: charge.description,
      quantity: charge.quantity.toString(),
      unitPrice: charge.unit_price.toString(),
      amount: charge.amount.toString(),
      isFromTreatmentCharge: true,
      isEditable: charge.status === "PENDING",
      status: charge.status,
      showSuggestions: false,
      filteredCharges: [],
      // 👇 Preserve zero values
      discountPercent: charge.discount_percent != null ? charge.discount_percent.toString() : "",
      taxPercent: charge.tax_percent != null ? charge.tax_percent.toString() : "",
    }));

    setBillingItems(treatmentChargesItems);
  } catch (err) {
    console.error(err);
    setTreatmentCharges([]);
    setBillingItems([]);
  }
};
  const fetchAvailablePaidInvoices = async (patientId) => {
    try {
      const res = await api.get(
        `/hospital-billing/patient/${patientId}/available-paid-invoices`
      );

      const availableInvoices = res.data.available_invoices || [];
      setAvailablePaidInvoices(availableInvoices);
      setShowConsolidateInvoices(true);

      return availableInvoices;
    } catch (err) {
      console.error("Failed to fetch available paid invoices:", err);
      setAvailablePaidInvoices([]);
      setShowConsolidateInvoices(true);
      return [];
    }
  };

  const fetchPatientInvoices = async (patientId) => {
    try {
      const res = await api.get("/hospital-billing/");
      const patientInvoicesData = res.data.filter(
        invoice => invoice.patient_id === patientId
      );

      const sortedInvoices = patientInvoicesData.sort((a, b) =>
        new Date(b.date) - new Date(a.date)
      );

      setPatientInvoices(sortedInvoices);
    } catch (err) {
      console.error("Failed to fetch patient invoices:", err);
      setPatientInvoices([]);
    }
  };

  const fetchPaymentSummary = async (patientId) => {
    try {
      const res = await api.get("/hospital-billing/");
      const patientInvoices = res.data.filter(
        invoice => invoice.patient_id === patientId
      );

      let totalPaid = 0;
      let totalPending = 0;
      const paymentHistory = [];
      const pendingInvoices = [];

      patientInvoices.forEach(invoice => {
        totalPaid += parseFloat(invoice.paid_amount) || 0;
        totalPending += parseFloat(invoice.pending_amount) || 0;

        if (invoice.payment_type === "Partial Payment") {
          paymentHistory.push({
            invoiceId: invoice.invoice_id,
            date: invoice.date,
            type: "Partial Payment",
            totalAmount: parseFloat(invoice.amount) || 0,
            paidAmount: parseFloat(invoice.paid_amount) || 0,
            pendingAmount: parseFloat(invoice.pending_amount) || 0,
            status: invoice.status,
            dueDate: invoice.due_date,
          });

          if (parseFloat(invoice.pending_amount) > 0) {
            pendingInvoices.push({
              invoice_id: invoice.invoice_id,
              invoiceId: invoice.invoice_id,
              date: invoice.date,
              amount: invoice.amount,
              paid_amount: invoice.paid_amount,
              pending_amount: invoice.pending_amount,
              pendingAmount: parseFloat(invoice.pending_amount),
              dueDate: invoice.due_date,
              status: invoice.status,
              payment_method: invoice.payment_method,
              department: invoice.department,
            });
          }
        }
      });

      setPaymentSummary({
        totalPaid,
        totalPending,
        paymentHistory: paymentHistory.sort((a, b) => new Date(b.date) - new Date(a.date)),
        pendingInvoices: pendingInvoices.sort((a, b) => new Date(b.date) - new Date(a.date)),
      });

    } catch (err) {
      console.error("Failed to fetch payment summary:", err);
    }
  };

  const fetchInvoicePaymentHistory = async (invoiceId) => {
    try {
      const res = await api.get(`/hospital-billing/invoice/${invoiceId}/payment-history`);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch payment history:", err);
      return [];
    }
  };

  const fetchInsurances = async (uniqueId) => {
    try {
      const res = await api.get(`/patients/${uniqueId}/insurances`);
      let insuranceData = [];
      if (Array.isArray(res.data)) {
        insuranceData = res.data;
      } else if (res.data && Array.isArray(res.data.results)) {
        insuranceData = res.data.results;
      } else if (res.data && Array.isArray(res.data.data)) {
        insuranceData = res.data.data;
      } else if (res.data && Array.isArray(res.data.insurances)) {
        insuranceData = res.data.insurances;
      } else {
        return;
      }
      setInsurances(
        insuranceData.map((ins) => ({
          id: ins.id,
          provider: ins.provider,
          policyNum: ins.policy_number,
          validFrom: ins.valid_from,
          validTo: ins.valid_to,
          policyCard: ins.policy_card,
        }))
      );
    } catch (err) {
      console.error("Failed to load insurances:", err);
    }
  };

  const generatePaymentInvoice = async (invoiceId, paymentAmount, paymentMethod, transactionId = null) => {
    try {
      const response = await api.post(
        `/hospital-billing/invoice/${invoiceId}/generate-payment-invoice`,
        {
          payment_amount: paymentAmount,
          payment_method: paymentMethod,
          transaction_id: transactionId || `PYMT_${Date.now()}`,
          is_final_payment: true,
        },
        {
          responseType: "blob",
        }
      );

      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(pdfBlob);
      
      // Force open in new tab with no cache
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Payment Invoice - ${invoiceId}</title>
              <style>
                body { margin: 0; height: 100vh; }
                iframe { border: none; width: 100%; height: 100vh; }
              </style>
            </head>
            <body>
              <iframe src="${url}"></iframe>
            </body>
          </html>
        `);
      } else {
        // Fallback if popup is blocked
        window.location.href = url;
      }
      
      setTimeout(() => window.URL.revokeObjectURL(url), 100);

      successToast("Payment invoice generated successfully!");
      return true;
    } catch (error) {
      console.error("Failed to generate payment invoice:", error);
      errorToast("Failed to generate payment invoice");
      return false;
    }
  };

 // ========== CONSOLIDATE INVOICE FUNCTION ==========
const generateConsolidateInvoice = async () => {
  if (selectedConsolidateInvoices.length === 0) {
    errorToast("Please select at least one paid invoice to consolidate");
    return;
  }

  if (!patientInfo.patientID) {
    errorToast("Please select a patient first");
    return;
  }
  // ✅ Check if patient has been discharged
  if (!patientInfo.endDate || patientInfo.endDate.trim() === "") {
    errorToast("Please discharge the patient before generating a consolidate invoice");
    return;
  }

  try {
    setGeneratingConsolidateInvoice(true);

    // ✅ Backend calculates totals from DB
    const consolidateData = {
      patient_id: patientInfo.patientID,
      patient_name: patientInfo.patientName,
      invoice_ids: selectedConsolidateInvoices,
      generated_date: new Date().toISOString().split("T")[0],
      billing_staff: patientInfo.billingStaff,
      billing_staff_id: patientInfo.billingStaffID,
    };

    const response = await api.post(
      "/hospital-billing/generate-consolidate-invoice",
      consolidateData,
      { responseType: "blob" }
    );

    // Open PDF
    const pdfBlob = new Blob([response.data], { type: "application/pdf" });
    const pdfUrl = window.URL.createObjectURL(pdfBlob);

    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Consolidate Invoice</title>
            <style>
              body { margin: 0; height: 100vh; }
              iframe { border: none; width: 100%; height: 100vh; }
            </style>
          </head>
          <body>
            <iframe src="${pdfUrl}"></iframe>
          </body>
        </html>
      `);
    } else {
      window.location.href = pdfUrl;
    }

    setTimeout(() => window.URL.revokeObjectURL(pdfUrl), 200);

    successToast(
      `✅ Consolidate invoice generated for ${selectedConsolidateInvoices.length} paid invoice(s)!`
    );

    // Refresh paid invoices list
    await fetchAvailablePaidInvoices(patientInfo.patientID);

    // Clear selections
    setSelectedConsolidateInvoices([]);

    // If all invoices got consolidated, switch back
    if (availablePaidInvoices.length === selectedConsolidateInvoices.length) {
      setInvoiceGenerationType("current");
      setShowConsolidateInvoices(false);
    }

  } catch (err) {
    console.error("Failed to generate consolidate invoice:", err);

    if (err.response) {
      if (err.response.status === 400) {
        errorToast(err.response.data.detail || "Some invoices cannot be consolidated.");
        await fetchAvailablePaidInvoices(patientInfo.patientID);
        setSelectedConsolidateInvoices([]);
      } else if (err.response.status === 422) {
        errorToast("Validation error. Please check selected invoices.");
      } else {
        errorToast(`Server error: ${err.response.status}`);
      }
    } else if (err.request) {
      errorToast("No response from server. Please check your connection.");
    } else {
      errorToast("Failed to generate consolidate invoice. Please try again.");
    }

  } finally {
    setGeneratingConsolidateInvoice(false);
  }
};


  const handleMarkInvoiceAsPaidFull = async (invoiceId = null, invoiceData = null) => {
    const targetInvoice = invoiceData || pendingInvoiceToPay;
    if (!targetInvoice) return;

    try {
      setLoading(true);

      const invoiceToPay = targetInvoice;
      
      const res = await api.post(
        `/hospital-billing/invoice/${invoiceToPay.invoice_id}/mark-paid`,
        {},
        { responseType: "blob" }
      );

      // Open PDF
      const pdfBlob = new Blob([res.data], { type: "application/pdf" });
      const pdfUrl = window.URL.createObjectURL(pdfBlob);
      
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Invoice ${invoiceToPay.invoice_id}</title>
              <style>
                body { margin: 0; height: 100vh; }
                iframe { border: none; width: 100%; height: 100vh; }
              </style>
            </head>
            <body>
              <iframe src="${pdfUrl}"></iframe>
            </body>
          </html>
        `);
      } else {
        window.location.href = pdfUrl;
      }
      
      setTimeout(() => window.URL.revokeObjectURL(pdfUrl), 100);

      successToast(
        `Invoice ${invoiceToPay.invoice_id} marked as Paid successfully!`
      );

      // Refresh data
      await fetchPatientInvoices(patientInfo.patientID);
      await fetchPaymentSummary(patientInfo.patientID);
      await fetchPendingTreatmentCharges(fullPatient?.patient_unique_id);

      return true;

    } catch (err) {
      console.error("Failed to mark invoice as paid:", err);
      errorToast(`Failed to update invoice ${targetInvoice.invoice_id} status`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleManualPayment = async (invoice, isFullPayment = false) => {
    setPendingInvoiceToPay(invoice);

    setManualPaymentData({
      amount: invoice.pending_amount.toString(),
      paymentMethod: patientInfo.paymentMode || "Cash",
      transactionId: `MANUAL_${Date.now()}`,
      remarks: isFullPayment ? "Full payment of pending invoice" : "Manual partial payment",
      generateInvoice: true,
    });

    setPayPendingInvoice(true);
  };

  const handleInvoiceGenerationTypeChange = (value) => {
    setInvoiceGenerationType(value);
    
    if (value === "consolidate") {
      if (patientInfo.patientID) {
        fetchAvailablePaidInvoices(patientInfo.patientID);
      }
      setShowConsolidateInvoices(true);
    } else {
      setShowConsolidateInvoices(false);
      setSelectedConsolidateInvoices([]);
    }
  };

  const handleAddPartialPayment = async () => {
    if (!selectedInvoice) {
      errorToast("Please select an invoice to add payment to");
      return;
    }

    const amount = parseFloat(addPaymentData.amountPaid);
    if (!amount || amount <= 0) {
      errorToast("Please enter a valid payment amount");
      return;
    }

    if (amount > selectedInvoice.pending_amount) {
      errorToast(`Payment amount cannot exceed pending amount ($${selectedInvoice.pending_amount})`);
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        `/hospital-billing/invoice/${selectedInvoice.invoice_id}/add-payment`,
        {
          amount_paid: amount,
          payment_method: addPaymentData.paymentMethod,
          transaction_id: addPaymentData.transactionId || `TXN_${Date.now()}`,
          remarks: addPaymentData.remarks || `Additional payment of $${amount}`,
        },
        { responseType: "blob" }
      );

      // Open PDF
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = window.URL.createObjectURL(pdfBlob);
      
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Payment Invoice - ${selectedInvoice.invoice_id}</title>
              <style>
                body { margin: 0; height: 100vh; }
                iframe { border: none; width: 100%; height: 100vh; }
              </style>
            </head>
            <body>
              <iframe src="${pdfUrl}"></iframe>
            </body>
          </html>
        `);
      }
      setTimeout(() => window.URL.revokeObjectURL(pdfUrl), 100);

      successToast(`Payment of $${amount} added successfully`);

      setAddPaymentData({
        amountPaid: "",
        paymentMethod: "Cash",
        transactionId: "",
        remarks: "",
        generateInvoice: false,
      });

      setShowAddPaymentModal(false);

      // Refresh data
      await fetchPatientInvoices(patientInfo.patientID);
      await fetchPaymentSummary(patientInfo.patientID);
      await fetchPendingTreatmentCharges(fullPatient?.patient_unique_id)

    } catch (error) {
      console.error("Failed to add payment:", error);
      errorToast("Failed to add payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const createTreatmentCharges = async (
  patientInternalId,
  billingItemsData,
  paymentStatus,
  paymentType
) => {
  try {
    if (!patientInternalId) {
      console.error("No patient internal ID available");
      return [];
    }

    let treatmentChargeStatus = "PENDING";

    if (paymentStatus === "Paid" && paymentType === "Full Payment") {
      treatmentChargeStatus = "BILLED";
    } else if (paymentType === "Partial Payment") {
      treatmentChargeStatus = "PARTIALLY_BILLED";
    }

    const createdCharges = [];

    for (const item of billingItemsData) {
      if (item.isFromTreatmentCharge) continue;

      const treatmentChargeData = {
        patient_id: patientInternalId,
        description: item.description,
        quantity: parseInt(item.quantity) || 1,
        unit_price: parseFloat(item.unitPrice) || 0,
        discount_percent: parseFloat(item.discountPercent) || 0,
        tax_percent: parseFloat(item.taxPercent) || 0,
        status: treatmentChargeStatus,
      };

      try {
        console.log("Creating treatment charge:", treatmentChargeData);
        const res = await api.post(
          "/hospital-billing/treatment-charges/",
          treatmentChargeData
        );
        createdCharges.push(res.data);
      } catch (chargeError) {
        console.error(
          `Failed to create treatment charge for item: ${item.description}`,
          chargeError
        );
      }
    }

    return createdCharges;
  } catch (err) {
    console.error("Failed to create treatment charges:", err);
    throw err;
  }
};

  // ========== CALCULATION FUNCTIONS ==========
  const calculateEffectiveTaxRate = () => {
    if (billingItems.length === 0) {
      setTaxConfig({
        effectiveTaxRate: 0,
        cgstRate: 0,
        sgstRate: 0,
      });
      return;
    }

    // Calculate weighted average tax rate based on item amounts
    let totalAmount = 0;
    let weightedTaxSum = 0;

    billingItems.forEach(item => {
      const itemAmount = parseFloat(item.amount) || 0;
      const itemTaxPercent = parseFloat(item.taxPercent) || 0;
      
      totalAmount += itemAmount;
      weightedTaxSum += (itemAmount * itemTaxPercent);
    });

    const effectiveTaxRate = totalAmount > 0 ? (weightedTaxSum / totalAmount) : 0;
    const halfTaxRate = effectiveTaxRate / 2;

    setTaxConfig({
      effectiveTaxRate: effectiveTaxRate,
      cgstRate: halfTaxRate,
      sgstRate: halfTaxRate,
    });
  };

  const calculateSubtotal = () => {
    return billingItems
      .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0)
      .toFixed(2);
  };

  const calculateTotalDiscountPercent = () => {
    if (billingItems.length === 0) return 0;
    
    const totalSubtotal = billingItems.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      return sum + (quantity * unitPrice);
    }, 0);
    
    const totalAfterDiscount = billingItems.reduce((sum, item) => {
      return sum + parseFloat(item.amount || 0);
    }, 0);
    
    if (totalSubtotal === 0) return 0;
    return ((totalSubtotal - totalAfterDiscount) / totalSubtotal * 100).toFixed(2);
  };

  const calculateTotalDiscountAmount = () => {
    const totalSubtotal = billingItems.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      return sum + (quantity * unitPrice);
    }, 0);
    
    const totalAfterDiscount = billingItems.reduce((sum, item) => {
      return sum + parseFloat(item.amount || 0);
    }, 0);
    
    return (totalSubtotal - totalAfterDiscount).toFixed(2);
  };

  const calculateTaxBreakdown = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const cgstAmount = (subtotal * (taxConfig.cgstRate / 100)).toFixed(2);
    const sgstAmount = (subtotal * (taxConfig.sgstRate / 100)).toFixed(2);
    return { cgstAmount, sgstAmount };
  };

  const calculateGrandTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const { cgstAmount, sgstAmount } = calculateTaxBreakdown();
    return (subtotal + parseFloat(cgstAmount) + parseFloat(sgstAmount)).toFixed(2);
  };

  const calculatePendingAmount = () => {
    if (patientInfo.paymentType !== "Partial Payment") return 0;
    
    const grandTotal = parseFloat(calculateGrandTotal());
    const paidAmount = parseFloat(partialPaymentData.paidAmount) || 0;
    
    return (grandTotal - paidAmount).toFixed(2);
  };

  const calculateSelectedPartialTotal = () => {
    if (selectedPartialInvoices.length === 0) return 0;
    
    return paymentSummary.pendingInvoices
      .filter(inv => selectedPartialInvoices.includes(inv.invoice_id))
      .reduce((sum, inv) => sum + (parseFloat(inv.pending_amount) || 0), 0)
      .toFixed(2);
  };

  const calculateConsolidateTotal = () => {
    if (!showConsolidateInvoices || selectedConsolidateInvoices.length === 0) return 0;
    
    return availablePaidInvoices
      .filter(inv => selectedConsolidateInvoices.includes(inv.invoice_id))
      .reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0)
      .toFixed(2);
  };

  // NEW: Calculate new charges total (before tax and discount)
  const calculateNewChargesSubtotal = () => {
    return billingItems
      .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0)
      .toFixed(2);
  };

  // NEW: Calculate total payable amount (new charges after tax + selected pending invoices)
  const calculateTotalPayable = () => {
    const newChargesAfterTax = parseFloat(calculateGrandTotal());
    const selectedPendingTotal = parseFloat(calculateSelectedPartialTotal());
    return (newChargesAfterTax + selectedPendingTotal).toFixed(2);
  };

  // ========== HANDLER FUNCTIONS ==========
  const handlePatientNameChange = (value) => {
    const patient = filteredPatients.find((p) => p.name === value);
    if (patient) {
      setPatientInfo((prev) => ({
        ...prev,
        patientName: value,
        patientID: patient.id,
      }));
      setBillingItems([]);
      setTreatmentCharges([]);
      fetchPatientDetails(patient.id);
      setSearchQuery("");
    }
  };

  const handlePatientIDChange = (value) => {
    const patient = filteredPatients.find((p) => p.id === value);
    if (patient) {
      setPatientInfo((prev) => ({
        ...prev,
        patientID: value,
        patientName: patient.name,
      }));
      setBillingItems([]);
      setTreatmentCharges([]);
      fetchPatientDetails(value);
    }
  };

  const handleInputChange = (value, field) => {
    setPatientInfo({ ...patientInfo, [field]: value });
    // Clear validation error when field is updated
    if (value && value.trim() !== "") {
      setValidationErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handlePartialPaymentChange = (value, field) => {
    setPartialPaymentData({ ...partialPaymentData, [field]: value });
  };

  // ========== VALIDATION FUNCTIONS ==========
  const validatePaymentFields = () => {
    const errors = {
      paymentMode: "",
      paymentType: "",
      paymentStatus: ""
    };
    
    let isValid = true;
    
    if (!patientInfo.paymentMode || patientInfo.paymentMode.trim() === "") {
      errors.paymentMode = "Payment mode is required";
      isValid = false;
    }
    
    if (!patientInfo.paymentType || patientInfo.paymentType.trim() === "") {
      errors.paymentType = "Payment type is required";
      isValid = false;
    }
    
    if (!patientInfo.paymentStatus || patientInfo.paymentStatus.trim() === "") {
      errors.paymentStatus = "Payment status is required";
      isValid = false;
    }
    
    setValidationErrors(errors);
    return isValid;
  };

  // ========== BILLING ITEMS MANAGEMENT ==========
  const handleAddBillingItem = () => {
    const newItem = {
      id: Date.now(),
      sNo: (billingItems.length + 1).toString().padStart(2, "0"),
      description: "",
      quantity: "1",
      unitPrice: "0",
      amount: "0",
      isFromTreatmentCharge: false,
      isEditable: true,
      showSuggestions: false,
      filteredCharges: [],
      discountPercent: "",
      taxPercent: "",
    };

    setBillingItems([...billingItems, newItem]);
  };

  const handleSelectCharge = (index, charge) => {
    const updatedItems = [...billingItems];

    updatedItems[index].description = charge.charge;
    updatedItems[index].unitPrice = String(charge.unit_price || 0);

    const quantity = parseFloat(updatedItems[index].quantity) || 1;
    const unitPrice = parseFloat(updatedItems[index].unitPrice) || 0;
    const subtotal = quantity * unitPrice;
    
    // Apply discount if any
    const discountPercent = parseFloat(updatedItems[index].discountPercent) || 0;
    const discountAmount = (subtotal * discountPercent) / 100;
    const afterDiscount = subtotal - discountAmount;
    
    // Apply tax if any
    const taxPercent = parseFloat(updatedItems[index].taxPercent) || 0;
    const taxAmount = (afterDiscount * taxPercent) / 100;
    
    updatedItems[index].amount = (afterDiscount + taxAmount).toFixed(2);

    updatedItems[index].showSuggestions = false;
    updatedItems[index].filteredCharges = [];

    setBillingItems(updatedItems);
  };

  const handleDeleteBillingItem = async (index) => {
    const item = billingItems[index];

    if (item.isFromTreatmentCharge && item.chargeId) {
      try {
        await deleteTreatmentCharge(item.chargeId);
        successToast("Treatment charge deleted");
      } catch {
        return;
      }
    }

    const updatedItems = billingItems.filter((_, i) => i !== index);
    const reorderedItems = updatedItems.map((item, idx) => ({
      ...item,
      sNo: (idx + 1).toString().padStart(2, "0"),
    }));

    setBillingItems(reorderedItems);
  };

  const handleEditBillingItem = (index, field, value) => {
    const updatedItems = [...billingItems];
    
    // Allow empty string for discount and tax fields to enable deletion
    if (field === "discountPercent" || field === "taxPercent") {
      updatedItems[index][field] = value;
    } else {
      updatedItems[index][field] = value;
    }

    if (field === "description") {
      const query = value.toLowerCase().trim();

      if (query.length > 0) {
        const filtered = chargesList
          .filter((c) => c.charge?.toLowerCase().includes(query))
          .slice(0, 8);

        updatedItems[index].filteredCharges = filtered;
        updatedItems[index].showSuggestions = true;
      } else {
        updatedItems[index].filteredCharges = [];
        updatedItems[index].showSuggestions = false;
      }
    }

    if (["quantity", "unitPrice", "description", "discountPercent", "taxPercent"].includes(field)) {
      const quantity = parseFloat(updatedItems[index].quantity) || 0;
      const unitPrice = parseFloat(updatedItems[index].unitPrice) || 0;
      const subtotal = quantity * unitPrice;
      
      // Apply discount if any (parseFloat handles empty string as 0)
      const discountPercent = parseFloat(updatedItems[index].discountPercent) || 0;
      const discountAmount = (subtotal * discountPercent) / 100;
      const afterDiscount = subtotal - discountAmount;
      
      // Apply tax if any (parseFloat handles empty string as 0)
      const taxPercent = parseFloat(updatedItems[index].taxPercent) || 0;
      const taxAmount = (afterDiscount * taxPercent) / 100;
      
      updatedItems[index].amount = (afterDiscount + taxAmount).toFixed(2);
    }

    if (updatedItems[index].isFromTreatmentCharge && updatedItems[index].isEditable) {
      const chargeId = updatedItems[index].chargeId;

      if (chargeId) {
        updateTreatmentCharge(chargeId, {
          description: updatedItems[index].description,
          quantity: parseInt(updatedItems[index].quantity) || 1,
          unit_price: parseFloat(updatedItems[index].unitPrice) || 0,
          amount: parseFloat(updatedItems[index].amount) || 0,
          discount_percent: parseFloat(updatedItems[index].discountPercent) || 0,
          tax_percent: parseFloat(updatedItems[index].taxPercent) || 0,
        });
      }
    }

    setBillingItems(updatedItems);
  };

  const handleEditSNo = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const numValue = parseInt(value) || 0;
    if (numValue < 1 || numValue > billingItems.length) {
      errorToast(`S.No must be between 1 and ${billingItems.length}`);
      return;
    }

    const updatedItems = [...billingItems];
    updatedItems[index].sNo = value.padStart(2, "0");

    const sortedItems = updatedItems.sort((a, b) => {
      const aNum = parseInt(a.sNo) || 0;
      const bNum = parseInt(b.sNo) || 0;
      return aNum - bNum;
    });

    const finalItems = sortedItems.map((item, idx) => ({
      ...item,
      sNo: (idx + 1).toString().padStart(2, "0"),
    }));

    setBillingItems(finalItems);
  };

  const handleToggleSelectAllPartial = () => {
    if (selectedPartialInvoices.length === paymentSummary.pendingInvoices.length) {
      setSelectedPartialInvoices([]);
    } else {
      setSelectedPartialInvoices(paymentSummary.pendingInvoices.map(inv => inv.invoice_id));
    }
  };

  const handleToggleSelectPartialInvoice = (invoiceId) => {
    setSelectedPartialInvoices(prev => {
      if (prev.includes(invoiceId)) {
        return prev.filter(id => id !== invoiceId);
      } else {
        return [...prev, invoiceId];
      }
    });
  };

  const handleToggleSelectAllConsolidate = () => {
    if (selectedConsolidateInvoices.length === availablePaidInvoices.length) {
      setSelectedConsolidateInvoices([]);
    } else {
      setSelectedConsolidateInvoices(availablePaidInvoices.map(inv => inv.invoice_id));
    }
  };

  const handleToggleSelectConsolidateInvoice = (invoiceId) => {
    setSelectedConsolidateInvoices(prev => {
      if (prev.includes(invoiceId)) {
        return prev.filter(id => id !== invoiceId);
      } else {
        return [...prev, invoiceId];
      }
    });
  };

  const subtotal = calculateSubtotal();
  const newChargesSubtotal = calculateNewChargesSubtotal();
  const totalDiscountPercent = calculateTotalDiscountPercent();
  const totalDiscountAmount = calculateTotalDiscountAmount();
  const { cgstAmount, sgstAmount } = calculateTaxBreakdown();
  const grandTotal = calculateGrandTotal();
  const pendingAmount = calculatePendingAmount();
  const selectedPartialTotal = calculateSelectedPartialTotal();
  const totalPayable = calculateTotalPayable();
  const consolidateTotal = calculateConsolidateTotal();
  
  const formattedSubtotal = parseFloat(subtotal).toLocaleString();
  const formattedNewChargesSubtotal = parseFloat(newChargesSubtotal).toLocaleString();
  const formattedTotalDiscountAmount = parseFloat(totalDiscountAmount).toLocaleString();
  const formattedCgst = parseFloat(cgstAmount).toLocaleString();
  const formattedSgst = parseFloat(sgstAmount).toLocaleString();
  const formattedGrand = parseFloat(grandTotal).toLocaleString();
  const formattedPending = parseFloat(pendingAmount).toLocaleString();
  const formattedSelectedPartialTotal = parseFloat(selectedPartialTotal).toLocaleString();
  const formattedTotalPayable = parseFloat(totalPayable).toLocaleString();
  const formattedConsolidateTotal = parseFloat(consolidateTotal).toLocaleString();

  // ========== INSURANCE FUNCTIONS ==========
  const handleEditInsurance = (index) => {
    const insurance = insurances[index];
    setModalData({
      provider: insurance.provider,
      policyNum: insurance.policyNum,
      validFrom: insurance.validFrom,
      validTo: insurance.validTo,
      policyCard: insurance.policyCard,
    });
    setEditingIndex(index);
    setShowModal(true);
  };

  const handleDeleteInsurance = async (index) => {
    const insId = insurances[index].id;
    try {
      await api.delete(`/insurances/${insId}`);
      fetchInsurances(patientInfo.patientID);
      successToast("Insurance deleted successfully");
    } catch (err) {
      console.error("Failed to delete insurance:", err);
      errorToast("Failed to delete insurance");
    }
  };

  const handleAddOrUpdateInsurance = async () => {
    try {
      const formData = new FormData();
      formData.append("provider", modalData.provider);
      formData.append("policy_number", modalData.policyNum);
      formData.append("valid_from", modalData.validFrom);
      formData.append("valid_to", modalData.validTo);
      if (modalData.policyCard instanceof File) {
        formData.append("policy_card", modalData.policyCard);
      }
      let res;
      if (editingIndex !== null) {
        const insId = insurances[editingIndex].id;
        res = await api.put(`/insurances/${insId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        successToast("Insurance updated successfully");
      } else {
        formData.append("patient_id", patientInfo.patientID);
        res = await api.post("/insurances/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        successToast("Insurance added successfully");
      }
      fetchInsurances(patientInfo.patientID);
      setShowModal(false);
      setEditingIndex(null);
      setModalData(emptyModal);
    } catch (err) {
      console.error("Failed to add/update insurance:", err);
      errorToast("Failed to add/update insurance");
    }
  };

  

// ========== PAY SELECTED PARTIAL INVOICES FUNCTION ==========
const handlePaySelectedPartialInvoices = async () => {
  if (selectedPartialInvoices.length === 0) {
    errorToast("Please select at least one pending invoice to pay");
    return;
  }

  if (!patientInfo.patientID) {
    errorToast("Patient ID is required");
    return;
  }

  setPaySelectedPartialInvoices(true);
  setLoading(true);

  try {
    // Prepare payload for settlement endpoint
    const payload = {
      patient_id: patientInfo.patientID,
      invoice_ids: selectedPartialInvoices,
      payment_method: patientInfo.paymentMode || "Cash",
      transaction_id: `SET_${Date.now()}`,
      remarks: `Settlement of ${selectedPartialInvoices.length} pending invoice(s)`
    };

    console.log("📤 Sending settlement request:", payload);

    // Call the settlement endpoint with blob response type for PDF
    const response = await api.post(
      "/hospital-billing/settle-invoices",  // Updated endpoint
      payload,
      { responseType: "blob" }
    );

    // Open the settlement invoice PDF
    const pdfBlob = new Blob([response.data], { type: "application/pdf" });
    const pdfUrl = window.URL.createObjectURL(pdfBlob);

    // Force open in new tab with no cache
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Settlement Invoice</title>
            <style>
              body { margin: 0; height: 100vh; }
              iframe { border: none; width: 100%; height: 100vh; }
            </style>
          </head>
          <body>
            <iframe src="${pdfUrl}"></iframe>
          </body>
        </html>
      `);
    } else {
      // Fallback if popup is blocked
      window.location.href = pdfUrl;
    }

    setTimeout(() => window.URL.revokeObjectURL(pdfUrl), 100);

    // Extract metadata from response headers
    const totalPaid = response.headers["x-total-paid"] || 
                     parseFloat(calculateSelectedPartialTotal()).toFixed(2);
    const invoicesCount = response.headers["x-invoices-count"] || 
                         selectedPartialInvoices.length;

    successToast(
      `✅ Successfully settled ${invoicesCount} pending invoice(s)!\n` +
      `Total paid: $${parseFloat(totalPaid).toLocaleString()}`
    );

    // Refresh all relevant data
    await Promise.all([
      fetchPatientInvoices(patientInfo.patientID),
      fetchPaymentSummary(patientInfo.patientID),
      fetchPendingTreatmentCharges(fullPatient?.patient_unique_id),
      fetchAvailablePaidInvoices(patientInfo.patientID)
    ]);

    // Clear selections
    setSelectedPartialInvoices([]);

  } catch (error) {
    console.error("❌ Failed to process settlement:", error);
    
    // Handle error response if it's a blob (error details might be in JSON format)
    if (error.response && error.response.data instanceof Blob) {
      try {
        const errorText = await error.response.data.text();
        const errorJson = JSON.parse(errorText);
        errorToast(errorJson.detail || "Failed to settle invoices");
      } catch (e) {
        errorToast("Failed to settle invoices. Please try again.");
      }
    } else if (error.response && error.response.data) {
      errorToast(error.response.data.detail || "Failed to settle invoices");
    } else {
      errorToast("Failed to process payment. Please try again.");
    }
  } finally {
    setPaySelectedPartialInvoices(false);
    setLoading(false);
  }
};

const generateNewInvoice = async (
  shouldResetForm = true,
  skipLoadingState = false,
  extraPayload = {}
) => {
  // Validate billing items
  if (billingItems.length === 0) {
    errorToast("Please add at least one treatment charge item");
    return false;
  }

  if (billingItems.some((item) => !item.description || !item.quantity || !item.unitPrice)) {
    errorToast("Please add valid billing items");
    return false;
  }

  // Partial Payment Validation
  if (patientInfo.paymentType === "Partial Payment") {
    const paidAmount = parseFloat(partialPaymentData.paidAmount) || 0;
    const grand = parseFloat(calculateGrandTotal());

    if (!partialPaymentData.paidAmount || paidAmount <= 0) {
      errorToast("Please enter a valid paid amount for partial payment");
      return false;
    }

    if (paidAmount > grand) {
      errorToast("Paid amount cannot exceed the grand total");
      return false;
    }

    if (!partialPaymentData.dueDate) {
      errorToast("Please select a due date for partial payment");
      return false;
    }
  }

  try {
    const today = new Date().toISOString().split("T")[0];

    const formatDateForBackend = (dateString) => {
      if (!dateString) return null;
      dateString = dateString.split("T")[0];
      let date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0];
      }
      return null;
    };

    const generateTransactionId = () => {
      return `TXN_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 5)
        .toUpperCase()}`;
    };

    const admissionDate = formatDateForBackend(patientInfo.startDate);
    if (!admissionDate) {
      errorToast("Please provide a valid admission date in YYYY-MM-DD format");
      return false;
    }

    const patientInternalId = fullPatient?.id;
    if (!patientInternalId) {
      errorToast("Patient internal ID not found");
      return false;
    }

    // Create treatment charges for manual items
    const manualBillingItems = billingItems.filter((item) => !item.isFromTreatmentCharge);

    let newlyCreatedCharges = [];
    if (manualBillingItems.length > 0) {
      newlyCreatedCharges = await createTreatmentCharges(
        patientInternalId,
        manualBillingItems,
        patientInfo.paymentStatus,
        patientInfo.paymentType
      );
    }

    // Collect treatment charge IDs
    const newChargeIds = newlyCreatedCharges.map((c) => c.id);

    const existingChargeIds = billingItems
      .filter((item) => item.isFromTreatmentCharge && item.chargeId)
      .map((item) => item.chargeId);

    const treatmentChargeIds = [...new Set([...existingChargeIds, ...newChargeIds])];

    const totalDiscountPercent = parseFloat(calculateTotalDiscountPercent());

    // Invoice Data
    const invoiceData = {
      // Basic Info
      date: today,
      patient_name: patientInfo.patientName,
      patient_id: patientInfo.patientID,
      department: patientInfo.department || "General Ward",
      payment_method: patientInfo.paymentMode || "Cash",
      status: patientInfo.paymentStatus || "Pending",
      payment_type: patientInfo.paymentType,

      // Patient Info
      admission_date: admissionDate,
      discharge_date: formatDateForBackend(patientInfo.endDate),
      doctor: patientInfo.doctorName || "N/A",
      phone: fullPatient?.phone_number || "N/A",
      email: fullPatient?.email_address || null,
      address: patientInfo.address || "",

      // Discount
      discount_percent: totalDiscountPercent,

      // Tax fields
      cgst_percent: taxConfig.cgstRate,
      sgst_percent: taxConfig.sgstRate,
      tax_percent: taxConfig.effectiveTaxRate,

      // Transaction
      transaction_id: generateTransactionId(),
      payment_date: patientInfo.paymentStatus === "Paid" ? today : null,

      // Items
      invoice_items: billingItems.map((item) => ({
        description: item.description,
        quantity: parseInt(item.quantity) || 1,
        unit_price: parseFloat(item.unitPrice) || 0,
        discount_percent: parseFloat(item.discountPercent) || 0,
        tax_percent: parseFloat(item.taxPercent) || 0,
      })),

      // Charges
      treatment_charge_ids: treatmentChargeIds,
    };

    // Partial Payment
    if (patientInfo.paymentType === "Partial Payment") {
      invoiceData.partial_payment = {
        paid_amount: parseFloat(partialPaymentData.paidAmount) || 0,
        due_date: partialPaymentData.dueDate,
        remarks: partialPaymentData.remarks || "",
      };
    }

    // ✅ Scenario 3 settlement
    if (extraPayload?.settle_invoice_ids?.length > 0) {
      invoiceData.settle_invoice_ids = extraPayload.settle_invoice_ids;
    }

    console.log("📤 Sending invoice data:", JSON.stringify(invoiceData, null, 2));

    // Generate invoice PDF
    const res = await api.post("/hospital-billing/generate-invoice", invoiceData, {
      responseType: "blob",
    });

    // Open PDF
    const pdfBlob = new Blob([res.data], { type: "application/pdf" });
    const pdfUrl = window.URL.createObjectURL(pdfBlob);

    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Invoice</title>
            <style>
              body { margin: 0; height: 100vh; }
              iframe { border: none; width: 100%; height: 100vh; }
            </style>
          </head>
          <body>
            <iframe src="${pdfUrl}"></iframe>
          </body>
        </html>
      `);
    } else {
      window.location.href = pdfUrl;
    }

    setTimeout(() => window.URL.revokeObjectURL(pdfUrl), 100);

    // Invoice ID
    const invoiceId = res.headers["x-invoice-id"] || null;

    successToast(`✅ Invoice ${invoiceId || ""} generated successfully!`);

    // Refresh data
    await fetchPatientInvoices(patientInfo.patientID);
    await fetchPaymentSummary(patientInfo.patientID);
    await fetchPendingTreatmentCharges(fullPatient?.patient_unique_id);

    if (shouldResetForm) resetForm();

    return true;

  } catch (err) {
    console.error("❌ Failed to generate invoice:", err);
    errorToast("Failed to generate invoice. Please try again.");
    return false;
  }
};

const resetForm = () => {
  setPatientInfo({
    patientName: "",
    patientID: "",
    ageGender: "",
    startDate: "",
    endDate: "",
    dateOfBirth: "",
    address: "",
    roomType: "",
    doctorName: "",
    department: "",
    billingStaff: staffInfo.staffName,
    billingStaffID: staffInfo.staffID,
    paymentMode: "",
    paymentType: "Full Payment",
    paymentStatus: "",
    bedGroup: "",
    bedNumber: "",
  });

  setBillingItems([]);
  setTreatmentCharges([]);
  setFullPatient(null);

  setPartialPaymentData({
    paidAmount: "",
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    remarks: "",
  });

  setPaymentSummary({
    totalPaid: 0,
    totalPending: 0,
    paymentHistory: [],
    pendingInvoices: [],
  });

  setPatientInvoices([]);
  setSelectedInvoice(null);
  setSelectedPartialInvoices([]);
  setPayPendingInvoice(false);
  setPendingInvoiceToPay(null);
  setAvailablePaidInvoices([]);
  setSelectedConsolidateInvoices([]);
  setShowConsolidateInvoices(false);
  setInvoiceGenerationType("current");
  
  // Clear validation errors
  setValidationErrors({
    paymentMode: "",
    paymentType: "",
    paymentStatus: ""
  });

  successToast("Form reset. Ready for next patient.");
};

const handleGenerateBill = async () => {
  if (generatingBill || loading || generatingConsolidateInvoice) return;

  // Validate payment fields first
  if (!validatePaymentFields()) {
    errorToast("Please fill in all required payment fields");
    return;
  }

  if (invoiceGenerationType === "consolidate") {
    await generateConsolidateInvoice();
    return;
  }

  if (!patientInfo.patientID) {
    errorToast("Please select a patient first");
    return;
  }

  const hasNewItems = billingItems.length > 0;
  const hasSelectedPartialInvoices = selectedPartialInvoices.length > 0;

  if (!hasNewItems && !hasSelectedPartialInvoices) {
    errorToast("Please add treatment charges or select pending invoices to pay");
    return;
  }

  try {
    setGeneratingBill(true);

    // ===== SCENARIO 1: Only pay selected partial invoices =====
    if (!hasNewItems && hasSelectedPartialInvoices) {
  await handlePaySelectedPartialInvoices(); // This now calls the updated endpoint
  
  // Refresh data after payment
  await Promise.all([
    fetchPatientInvoices(patientInfo.patientID),
    fetchPaymentSummary(patientInfo.patientID),
    fetchPendingTreatmentCharges(fullPatient?.patient_unique_id),
    fetchAvailablePaidInvoices(patientInfo.patientID)
  ]);
  
  setGeneratingBill(false);
  return;
}

    // ===== SCENARIO 2: Only generate invoice for new items =====
    if (hasNewItems && !hasSelectedPartialInvoices) {
      await generateNewInvoice(true);
      setGeneratingBill(false);
      return;
    }

    // ===== SCENARIO 3: New items + selected partial invoices =====
    if (hasNewItems && hasSelectedPartialInvoices) {
      const invoicesToSettle = [...selectedPartialInvoices];

      const result = await generateNewInvoice(
        false,
        true,
        {
          settle_invoice_ids: invoicesToSettle,
        }
      );

      if (!result) throw new Error("Failed to generate invoice with settlement");

      successToast(
        `✅ Invoice generated successfully!\n` +
        `Settled ${invoicesToSettle.length} pending invoice(s) in same PDF.`
      );

      // Refresh data
      await Promise.all([
        fetchPatientInvoices(patientInfo.patientID),
        fetchPaymentSummary(patientInfo.patientID),
        fetchPendingTreatmentCharges(fullPatient?.patient_unique_id),
        fetchAvailablePaidInvoices(patientInfo.patientID)
      ]);

      setSelectedPartialInvoices([]);
      resetForm();
      setGeneratingBill(false);
      return;
    }

  } catch (err) {
    console.error("❌ Failed to process billing:", err);
    errorToast("Failed to process billing. Please try again.");
  } finally {
    setGeneratingBill(false);
  }
};

  
  // ========== RENDER FUNCTIONS ==========
  const renderBillingTableContent = () => {
    if (!patientInfo.patientID) {
      return (
        <tr>
          <td colSpan="7" className="p-4 text-center text-gray-500 dark:text-gray-400">
            Please select a patient to view treatment charges
          </td>
        </tr>
      );
    }
  
    if (billingItems.length === 0) {
      return (
        <tr>
          <td colSpan="7" className="p-4 text-center text-gray-500 dark:text-gray-400">
            No treatment charges found for this patient
          </td>
        </tr>
      );
    }
  
    return billingItems.map((item, index) => (
      <tr
        key={index}
        className="border-b border-gray-300 dark:border-gray-800 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B0D]"
      >
        <td className="p-2">
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={item.sNo}
              onChange={(e) => handleEditSNo(index, e.target.value)}
              className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-1 rounded-md w-12 text-center text-[#08994A] dark:text-white"
              style={{
                border: "2px solid #0EFF7B1A",
                boxShadow: "0px 0px 2px 0px #0EFF7B",
              }}
              disabled={item.isFromTreatmentCharge}
            />
            {(item.isEditable || !item.isFromTreatmentCharge) && (
              <button
                onClick={() => handleDeleteBillingItem(index)}
                className="p-1 text-red-500 hover:text-red-700"
                title="Delete row"
              >
                <Trash size={14} />
              </button>
            )}
          </div>
        </td>
        
        <td className="p-2 relative">
          <div className="relative">
            <input
              type="text"
              value={item.description}
              onChange={(e) =>
                handleEditBillingItem(index, "description", e.target.value)
              }
              className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-1 rounded-md w-full text-[#08994A] dark:text-white"
              style={{
                border: "2px solid #0EFF7B1A",
                boxShadow: "0px 0px 2px 0px #0EFF7B",
              }}
              placeholder="Enter description"
            />

            {item.showSuggestions && item.filteredCharges?.length > 0 && (
              <div className="absolute left-0 right-0 z-50 mt-1 max-h-52 overflow-auto rounded-md bg-gray-100 dark:bg-black border border-[#0EFF7B] dark:border-[#3C3C3C] shadow-lg">
                {item.filteredCharges.map((charge) => (
                  <div
                    key={charge.id}
                    onClick={() => handleSelectCharge(index, charge)}
                    className="cursor-pointer p-2 text-[#08994A] dark:text-white hover:bg-[#0EFF7B1A] dark:hover:bg-[#025126]"
                  >
                    <div className="flex justify-between">
                      <span>{charge.charge}</span>
                      <span className="text-gray-500 dark:text-gray-400">
                        ${parseFloat(charge.unit_price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </td>
        
        <td className="p-2">
          <div className="flex items-center gap-1">
            {item.isEditable && (
              <button
                onClick={() => {
                  const currentQty = parseInt(item.quantity) || 0;
                  if (currentQty > 1) {
                    handleEditBillingItem(index, "quantity", (currentQty - 1).toString());
                  }
                }}
                className="p-1 bg-[#0EFF7B1A] rounded"
              >
                <Minus size={12} />
              </button>
            )}
            <input
              type="text"
              value={item.quantity}
              onChange={(e) => handleEditBillingItem(index, "quantity", e.target.value)}
              readOnly={!item.isEditable}
              className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-1 rounded-md w-16 text-center text-[#08994A] dark:text-white"
              style={{
                border: "2px solid #0EFF7B1A",
                boxShadow: "0px 0px 2px 0px #0EFF7B",
              }}
            />
            {item.isEditable && (
              <button
                onClick={() => {
                  const currentQty = parseInt(item.quantity) || 0;
                  handleEditBillingItem(index, "quantity", (currentQty + 1).toString());
                }}
                className="p-1 bg-[#0EFF7B1A] rounded"
              >
                <Plus size={12} />
              </button>
            )}
          </div>
        </td>
        
        <td className="p-2">
          <input
            type="text"
            value={item.unitPrice}
            onChange={(e) => handleEditBillingItem(index, "unitPrice", e.target.value)}
            readOnly
            className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-1 rounded-md w-24 text-[#08994A] dark:text-white"
            style={{
              border: "2px solid #0EFF7B1A",
              boxShadow: "0px 0px 2px 0px #0EFF7B",
            }}
          />
        </td>
        
        <td className="p-2">
          <input
            type="text"
            value={item.discountPercent}
            onChange={(e) => handleEditBillingItem(index, "discountPercent", e.target.value)}
            className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-1 rounded-md w-20 text-[#08994A] dark:text-white"
            style={{
              border: "2px solid #0EFF7B1A",
              boxShadow: "0px 0px 2px 0px #0EFF7B",
            }}
            placeholder="Disc %"
          />
        </td>
        
        <td className="p-2">
          <input
            type="text"
            value={item.taxPercent}
            onChange={(e) => handleEditBillingItem(index, "taxPercent", e.target.value)}
            className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-1 rounded-md w-20 text-[#08994A] dark:text-white"
            style={{
              border: "2px solid #0EFF7B1A",
              boxShadow: "0px 0px 2px 0px #0EFF7B",
            }}
            placeholder="Tax %"
          />
        </td>
        
        <td className="p-2">
          <input
            type="text"
            value={item.amount}
            readOnly
            className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] p-1 rounded-md w-24 text-[#08994A] dark:text-white cursor-not-allowed"
            style={{
              border: "2px solid #0EFF7B1A",
              boxShadow: "0px 0px 2px 0px #0EFF7B",
            }}
          />
        </td>
      </tr>
    ));
  };

  // ========== RENDER PARTIAL INVOICES SECTION ==========
  const renderPartialInvoicesSection = () => {
    // Only show in current invoice tab
    if (invoiceGenerationType !== "current") return null;
    
    const pendingInvoices = paymentSummary.pendingInvoices || [];
    
    if (pendingInvoices.length === 0) {
      return null; // Don't show anything if no pending invoices
    }

    return (
      <div className="mt-6 p-4 border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-lg bg-[#0EFF7B0A]">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-[#08994A] dark:text-[#0EFF7B] font-medium flex items-center gap-2">
            <Receipt size={20} />
            Select Pending Partial Invoices to Pay
          </h4>
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSelectAllPartial}
              className="text-sm text-[#08994A] dark:text-[#0EFF7B] hover:underline"
            >
              {selectedPartialInvoices.length === pendingInvoices.length ? "Deselect All" : "Select All"}
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Selected: {selectedPartialInvoices.length} / {pendingInvoices.length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[#08994A] dark:text-[#0EFF7B] bg-gray-200 dark:bg-[#091810]">
              <tr>
                <th className="p-2 w-16">
                  <input
                    type="checkbox"
                    checked={selectedPartialInvoices.length === pendingInvoices.length && pendingInvoices.length > 0}
                    onChange={handleToggleSelectAllPartial}
                    className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-white 
                      rounded-sm bg-gray-100 dark:bg-black 
                      checked:bg-[#08994A] dark:checked:bg-green-500 
                      checked:border-[#0EFF7B] dark:checked:border-green-500 
                      flex items-center justify-center 
                      checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black 
                      checked:before:text-sm"
                  />
                </th>
                <th className="p-2">Invoice ID</th>
                <th className="p-2">Date</th>
                <th className="p-2">Department</th>
                <th className="p-2 text-right">Total ($)</th>
                <th className="p-2 text-right">Paid ($)</th>
                <th className="p-2 text-right">Pending ($)</th>
                <th className="p-2">Due Date</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody className="text-[#08994A] dark:text-gray-300 bg-gray-100 dark:bg-black">
              {pendingInvoices.map((invoice, index) => {
                const totalAmount = parseFloat(invoice.amount) || 0;
                const paidAmount = parseFloat(invoice.paid_amount) || 0;
                const pendingAmount = parseFloat(invoice.pending_amount) || 0;

                return (
                  <tr key={index} className="border-b border-gray-300 dark:border-gray-800 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B0D]">
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selectedPartialInvoices.includes(invoice.invoice_id)}
                        onChange={() => handleToggleSelectPartialInvoice(invoice.invoice_id)}
                        className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-white 
                          rounded-sm bg-gray-100 dark:bg-black 
                          checked:bg-[#08994A] dark:checked:bg-green-500 
                          checked:border-[#0EFF7B] dark:checked:border-green-500 
                          flex items-center justify-center 
                          checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black 
                          checked:before:text-sm"
                      />
                    </td>
                    <td className="p-2 font-mono text-xs">
                      {invoice.invoice_id}
                    </td>
                    <td className="p-2">
                      {invoice.date}
                    </td>
                    <td className="p-2">
                      {invoice.department || "General"}
                    </td>
                    <td className="p-2 text-right">
                      ${totalAmount.toLocaleString()}
                    </td>
                    <td className="p-2 text-right text-green-600 dark:text-green-500">
                      ${paidAmount.toLocaleString()}
                    </td>
                    <td className="p-2 text-right text-orange-600 dark:text-orange-500 font-semibold">
                      ${pendingAmount.toLocaleString()}
                    </td>
                    <td className="p-2">
                      {invoice.due_date || 'N/A'}
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'Paid'
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                          : invoice.status === 'Partially Paid'
                          ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300'
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {selectedPartialInvoices.length > 0 && (
              <tfoot className="bg-gray-200 dark:bg-[#091810]">
                <tr>
                  <td colSpan="7" className="p-2 text-right font-semibold">
                    Total Selected Pending Amount:
                  </td>
                  <td className="p-2 text-right font-bold text-[#08994A] dark:text-[#0EFF7B]">
                    ${formattedSelectedPartialTotal}
                  </td>
                  <td colSpan="2"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    );
  };

  const renderConsolidateInvoicesSection = () => {
    if (!showConsolidateInvoices || !patientInfo.patientID) return null;
    
    if (availablePaidInvoices.length === 0) {
      return (
        <div className="mt-6 p-4 border border-yellow-500 dark:border-yellow-700 rounded-lg bg-yellow-50 dark:bg-yellow-900/10">
          <div>
            <h4 className="text-yellow-700 dark:text-yellow-400 font-medium mb-2 flex items-center gap-2">
              <FileText size={20} />
              Consolidate Invoice
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              No paid invoices available for consolidation. 
              All paid invoices for this patient have already been consolidated.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-6 p-4 border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-lg bg-[#0EFF7B0A]">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h4 className="text-[#08994A] dark:text-[#0EFF7B] font-medium flex items-center gap-2">
              <Receipt size={20} />
              Select Paid Invoices to Consolidate
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Only invoices not previously consolidated are shown
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSelectAllConsolidate}
              className="text-sm text-[#08994A] dark:text-[#0EFF7B] hover:underline"
            >
              {selectedConsolidateInvoices.length === availablePaidInvoices.length ? "Deselect All" : "Select All"}
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Selected: {selectedConsolidateInvoices.length} / {availablePaidInvoices.length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[#08994A] dark:text-[#0EFF7B] bg-gray-200 dark:bg-[#091810]">
              <tr>
                <th className="p-2 w-16">
                  <input
                    type="checkbox"
                    checked={selectedConsolidateInvoices.length === availablePaidInvoices.length && availablePaidInvoices.length > 0}
                    onChange={handleToggleSelectAllConsolidate}
                    className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-white 
                      rounded-sm bg-gray-100 dark:bg-black 
                      checked:bg-[#08994A] dark:checked:bg-green-500 
                      checked:border-[#0EFF7B] dark:checked:border-green-500 
                      flex items-center justify-center 
                      checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black 
                      checked:before:text-sm"
                  />
                </th>
                <th className="p-2">Invoice ID</th>
                <th className="p-2">Date</th>
                <th className="p-2">Department</th>
                <th className="p-2 text-right">Amount ($)</th>
                <th className="p-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-[#08994A] dark:text-gray-300 bg-gray-100 dark:bg-black">
              {availablePaidInvoices.map((invoice) => (
                <tr key={invoice.invoice_id} className="border-b border-gray-300 dark:border-gray-800 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B0D]">
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={selectedConsolidateInvoices.includes(invoice.invoice_id)}
                      onChange={() => handleToggleSelectConsolidateInvoice(invoice.invoice_id)}
                      className="appearance-none w-5 h-5 border border-[#0EFF7B] dark:border-white 
                        rounded-sm bg-gray-100 dark:bg-black 
                        checked:bg-[#08994A] dark:checked:bg-green-500 
                        checked:border-[#0EFF7B] dark:checked:border-green-500 
                        flex items-center justify-center 
                        checked:before:content-['✔'] checked:before:text-white dark:checked:before:text-black 
                        checked:before:text-sm"
                    />
                  </td>
                  <td className="p-2 font-mono text-xs">
                    {invoice.invoice_id}
                  </td>
                  <td className="p-2">
                    {invoice.date}
                  </td>
                  <td className="p-2">
                    {invoice.department || "General"}
                  </td>
                  <td className="p-2 text-right">
                    ${parseFloat(invoice.amount || 0).toLocaleString()}
                  </td>
                  <td className="p-2 text-right">
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full text-xs">
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            {selectedConsolidateInvoices.length > 0 && (
              <tfoot className="bg-gray-200 dark:bg-[#091810]">
                <tr>
                  <td colSpan="4" className="p-2 text-right font-semibold">
                    Total Selected Amount:
                  </td>
                  <td className="p-2 text-right font-bold text-[#08994A] dark:text-[#0EFF7B]">
                    ${formattedConsolidateTotal}
                  </td>
                  <td colSpan="1"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700 dark:text-blue-400">
              <strong>Note:</strong> The consolidate invoice will combine all selected paid invoices into a single PDF document. 
              Once generated, these invoices will be marked as consolidated and will no longer appear in this list.
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ========== RENDER PARTIAL PAYMENT SECTION (ONLY in current invoice tab) ==========
  const renderPartialPaymentSection = () => {
    if (invoiceGenerationType !== "current") return null;
    if (patientInfo.paymentType !== "Partial Payment") return null;

    return (
      <div className="mt-6 p-4 border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-lg bg-[#0EFF7B0A]">
        <h4 className="text-[#08994A] dark:text-[#0EFF7B] font-medium mb-3 flex items-center gap-2">
          <DollarSign size={20} />
          Partial Payment Details
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">
              Paid Amount ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={partialPaymentData.paidAmount}
              onChange={(e) =>
                handlePartialPaymentChange(e.target.value, "paidAmount")
              }
              className="w-full h-[33px] px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A]
                bg-transparent text-[#08994A] dark:text-white outline-none"
              placeholder="Enter paid amount"
              min="0"
              max={grandTotal}
              step="0.01"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">
              Due Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={partialPaymentData.dueDate}
                onChange={(e) =>
                  handlePartialPaymentChange(e.target.value, "dueDate")
                }
                className="w-full h-[33px] px-3 pr-10 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A]
                  bg-transparent text-[#08994A] dark:text-white outline-none
                  [&::-webkit-calendar-picker-indicator]:opacity-0
                  [&::-webkit-calendar-picker-indicator]:absolute
                  [&::-webkit-calendar-picker-indicator]:w-5
                  [&::-webkit-calendar-picker-indicator]:h-5
                  [&::-webkit-calendar-picker-indicator]:right-2
                  [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                min={new Date().toISOString().split("T")[0]}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0EFF7B] pointer-events-none w-4 h-4" />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">
              Remarks (Optional)
            </label>
            <input
              type="text"
              value={partialPaymentData.remarks}
              onChange={(e) =>
                handlePartialPaymentChange(e.target.value, "remarks")
              }
              className="w-full h-[33px] px-3 rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A]
                bg-transparent text-[#08994A] dark:text-white outline-none"
              placeholder="Payment remarks"
            />
          </div>
        </div>

        <div className="mt-4 p-3 bg-gradient-to-r from-[#02512610] to-[#0D7F4110] rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Total Charges:
              </span>
              <div className="text-lg font-bold text-[#08994A] dark:text-[#0EFF7B]">
                ${formattedGrand}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Today's Payment:
              </span>
              <div className="text-lg font-bold text-green-600 dark:text-green-500">
                ${parseFloat(partialPaymentData.paidAmount || 0).toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Balance After Payment:
              </span>
              <div className="text-lg font-bold text-orange-600 dark:text-orange-500">
                ${formattedPending}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Due Date:
              </span>
              <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {partialPaymentData.dueDate || "Not set"}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPayPendingInvoiceModal = () => {
    if (!payPendingInvoice || !pendingInvoiceToPay) return null;

    const totalAmount = parseFloat(pendingInvoiceToPay.amount) || 0;
    const alreadyPaid = parseFloat(pendingInvoiceToPay.paid_amount) || 0;
    const remainingBalance = parseFloat(pendingInvoiceToPay.pending_amount) || 0;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 font-[Helvetica] overflow-y-auto py-4">
        <div
          className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F]
                     bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70
                     dark:bg-[linear-gradient(132.3deg,rgba(34,197,94,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(34,197,94,0.7)_99.36%)]
                     overflow-visible my-4"
        >
          <div
            className="w-[900px] rounded-[19px] bg-gray-100 dark:bg-[#000000]
                       text-black dark:text-white p-6 relative overflow-visible"
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
          >
            <div className="flex justify-between items-center pb-3 mb-4">
              <h3 className="text-black dark:text-white font-medium text-[16px] leading-[19px] flex items-center gap-2">
                <CheckCircle size={20} />
                Pay Pending Invoice
              </h3>
              <button
                onClick={() => {
                  setPayPendingInvoice(false);
                  setPendingInvoiceToPay(null);
                  setManualPaymentData({
                    amount: "",
                    paymentMethod: "Cash",
                    transactionId: "",
                    remarks: "",
                    generateInvoice: true,
                  });
                }}
                className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A]
                           bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center"
              >
                <X size={16} className="text-black dark:text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                    ${remainingBalance.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Remaining Balance to Pay
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 block">
                        Invoice #
                      </span>
                      <span className="font-medium text-sm">
                        {pendingInvoiceToPay.invoice_id}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 block">
                        Date
                      </span>
                      <span className="text-sm">{pendingInvoiceToPay.date}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 block">
                        Total Amount
                      </span>
                      <span className="font-medium text-sm">
                        ${totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 block">
                        Already Paid
                      </span>
                      <span className="text-green-600 dark:text-green-500 text-sm">
                        ${alreadyPaid.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 block">
                        Payment Method
                      </span>
                      <span className="text-sm">
                        {manualPaymentData.paymentMethod}
                      </span>
                    </div>
                    <div className="pt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 block">
                        Remaining Balance
                      </span>
                      <span className="text-orange-600 dark:text-orange-500 font-bold text-sm">
                        ${remainingBalance.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                  Payment Details
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-black dark:text-white block mb-1">
                      Transaction ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={manualPaymentData.transactionId}
                      onChange={(e) => setManualPaymentData({...manualPaymentData, transactionId: e.target.value})}
                      className="w-full h-[33px] px-3 rounded-[8px] border bg-gray-100 dark:bg-transparent 
                                 placeholder-gray-400 dark:placeholder-gray-500 outline-none 
                                 text-black dark:text-[#0EFF7B] border-[#0EFF7B] dark:border-[#3A3A3A]"
                      placeholder="Enter transaction ID"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-black dark:text-white block mb-1">
                      Remarks (Optional)
                    </label>
                    <input
                      type="text"
                      value={manualPaymentData.remarks}
                      onChange={(e) => setManualPaymentData({...manualPaymentData, remarks: e.target.value})}
                      className="w-full h-[33px] px-3 rounded-[8px] border bg-gray-100 dark:bg-transparent 
                                 placeholder-gray-400 dark:placeholder-gray-500 outline-none 
                                 text-black dark:text-[#0EFF7B] border-[#0EFF7B] dark:border-[#3A3A3A]"
                      placeholder="Enter remarks"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="generatePaymentInvoiceFull"
                    checked={manualPaymentData.generateInvoice}
                    onChange={(e) => setManualPaymentData({...manualPaymentData, generateInvoice: e.target.checked})}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="generatePaymentInvoiceFull" className="text-sm text-gray-600 dark:text-gray-300">
                    Generate payment invoice
                  </label>
                </div>
              </div>

              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-yellow-700 dark:text-yellow-400">
                    <strong>Note:</strong> This will mark the invoice as paid, update treatment charges to 'BILLED' status, 
                    {manualPaymentData.generateInvoice && " and generate a payment invoice."}
                    {!manualPaymentData.generateInvoice && "."}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
              <button
                onClick={() => {
                  setPayPendingInvoice(false);
                  setPendingInvoiceToPay(null);
                  setManualPaymentData({
                    amount: "",
                    paymentMethod: "Cash",
                    transactionId: "",
                    remarks: "",
                    generateInvoice: true,
                  });
                }}
                className="w-[144px] h-[34px] rounded-[8px] py-2 px-1 border border-[#0EFF7B] dark:border-gray-600
                           text-gray-600 dark:text-white font-medium text-[14px] leading-[16px]
                           shadow-[0_2px_12px_0px_#00000040] bg-gray-100 dark:bg-transparent"
              >
                Cancel
              </button>
              <button
                onClick={() => handleMarkInvoiceAsPaidFull()}
                disabled={loading}
                className="w-[144px] h-[32px] rounded-[8px] py-2 px-3 border-b-[2px] border-[#0EFF7B66]
                           bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126]
                           shadow-[0_2px_12px_0px_#00000040] text-white font-medium text-[14px] leading-[16px]
                           hover:scale-105 transition disabled:opacity-70 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle size={16} />
                    {manualPaymentData.generateInvoice ? "Generate & Mark Paid" : "Mark as Paid"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAddPaymentModal = () => {
    if (!showAddPaymentModal || !selectedInvoice) return null;

    const remainingBalance = parseFloat(selectedInvoice.pending_amount) || 0;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 font-[Helvetica] overflow-y-auto py-4">
        <div
          className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F]
                     bg-gradient-to-r from-blue-400/70 via-gray-300/30 to-blue-400/70
                     dark:bg-[linear-gradient(132.3deg,rgba(59,130,246,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(59,130,246,0.7)_99.36%)]
                     overflow-visible my-4"
        >
          <div
            className="w-[500px] rounded-[19px] bg-gray-100 dark:bg-[#000000]
                       text-black dark:text-white p-6 relative overflow-visible"
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
          >
            <div className="flex justify-between items-center pb-3 mb-4">
              <h3 className="text-black dark:text-white font-medium text-[16px] leading-[19px]">
                Add Partial Payment
              </h3>
              <button
                onClick={() => {
                  setShowAddPaymentModal(false);
                  setAddPaymentData({
                    amountPaid: "",
                    paymentMethod: "Cash",
                    transactionId: "",
                    remarks: "",
                    generateInvoice: false,
                  });
                }}
                className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center"
              >
                <X size={16} className="text-black dark:text-white" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                Invoice #{selectedInvoice.invoice_id}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-xs text-gray-500">Total:</span>
                  <div className="font-semibold">${(parseFloat(selectedInvoice.amount) || 0).toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Paid:</span>
                  <div className="font-semibold text-green-600">${(parseFloat(selectedInvoice.paid_amount) || 0).toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Pending:</span>
                  <div className="font-semibold text-orange-600">${remainingBalance.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-black dark:text-white block mb-1">
                  Amount to Pay ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={addPaymentData.amountPaid}
                  onChange={(e) => setAddPaymentData({...addPaymentData, amountPaid: e.target.value})}
                  className="w-full h-[33px] px-3 rounded-[8px] border bg-gray-100 dark:bg-transparent 
                             placeholder-gray-400 dark:placeholder-gray-500 outline-none 
                             text-black dark:text-[#0EFF7B] border-[#0EFF7B] dark:border-[#3A3A3A]"
                  placeholder={`Enter amount (max: $${remainingBalance.toLocaleString()})`}
                  min="0.01"
                  max={remainingBalance}
                  step="0.01"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Remaining balance after payment: ${(remainingBalance - parseFloat(addPaymentData.amountPaid || 0)).toLocaleString()}
                </div>
              </div>

              <div>
                <label className="text-sm text-black dark:text-white block mb-1">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <Listbox
                  value={addPaymentData.paymentMethod}
                  onChange={(value) => setAddPaymentData({...addPaymentData, paymentMethod: value})}
                >
                  <div className="relative mt-1">
                    <Listbox.Button
                      className="w-full h-[33px] px-3 pr-8 rounded-[8px] border bg-gray-100 dark:bg-transparent 
                                 text-left text-[14px] leading-[16px] flex items-center justify-between group
                                 border-[#0EFF7B] dark:border-[#3A3A3A]"
                      style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                    >
                      <span className={`block truncate ${addPaymentData.paymentMethod ? "text-black dark:text-[#0EFF7B]" : "text-[#0EFF7B] dark:text-[#0EFF7B]"}`}>
                        {addPaymentData.paymentMethod}
                      </span>
                      <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                        <ChevronDown className="h-4 w-4 text-[#0EFF7B]" />
                      </span>
                    </Listbox.Button>
                    <Listbox.Options
                      className="absolute mt-0.5 w-full max-h-40 overflow-y-auto rounded-[12px] bg-gray-100 dark:bg-black
                                 shadow-lg z-50 border border-[#0EFF7B] dark:border-[#3A3A3A] left-[2px]"
                      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    >
                      {paymentModes.map((mode) => (
                        <Listbox.Option
                          key={mode}
                          value={mode}
                          className={({ active, selected }) =>
                            `cursor-pointer select-none py-2 px-2 text-sm rounded-md
                             ${
                               active
                                 ? "bg-[#0EFF7B33] text-[#0EFF7B]"
                                 : "text-black dark:text-white"
                             }
                             ${selected ? "font-medium text-[#0EFF7B]" : ""}`
                          }
                          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                        >
                          {mode}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
              </div>

              <div>
                <label className="text-sm text-black dark:text-white block mb-1">
                  Transaction ID (Optional)
                </label>
                <input
                  type="text"
                  value={addPaymentData.transactionId}
                  onChange={(e) => setAddPaymentData({...addPaymentData, transactionId: e.target.value})}
                  className="w-full h-[33px] px-3 rounded-[8px] border bg-gray-100 dark:bg-transparent 
                             placeholder-gray-400 dark:placeholder-gray-500 outline-none 
                             text-black dark:text-[#0EFF7B] border-[#0EFF7B] dark:border-[#3A3A3A]"
                  placeholder="Enter transaction ID"
                />
              </div>

              <div>
                <label className="text-sm text-black dark:text-white block mb-1">
                  Remarks (Optional)
                </label>
                <input
                  type="text"
                  value={addPaymentData.remarks}
                  onChange={(e) => setAddPaymentData({...addPaymentData, remarks: e.target.value})}
                  className="w-full h-[33px] px-3 rounded-[8px] border bg-gray-100 dark:bg-transparent 
                             placeholder-gray-400 dark:placeholder-gray-500 outline-none 
                             text-black dark:text-[#0EFF7B] border-[#0EFF7B] dark:border-[#3A3A3A]"
                  placeholder="Enter remarks"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="generatePaymentInvoice"
                  checked={addPaymentData.generateInvoice}
                  onChange={(e) => setAddPaymentData({...addPaymentData, generateInvoice: e.target.checked})}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="generatePaymentInvoice" className="text-sm text-gray-600 dark:text-gray-300">
                  Generate payment invoice for this transaction
                </label>
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => {
                  setShowAddPaymentModal(false);
                  setAddPaymentData({
                    amountPaid: "",
                    paymentMethod: "Cash",
                    transactionId: "",
                    remarks: "",
                    generateInvoice: false,
                  });
                }}
                className="w-[144px] h-[34px] rounded-[8px] py-2 px-1 border border-[#0EFF7B] dark:border-gray-600
                           text-gray-600 dark:text-white font-medium text-[14px] leading-[16px]
                           shadow-[0_2px_12px_0px_#00000040] bg-gray-100 dark:bg-transparent"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPartialPayment}
                disabled={loading || !addPaymentData.amountPaid || parseFloat(addPaymentData.amountPaid) <= 0}
                className="w-[144px] h-[32px] rounded-[8px] py-2 px-3 border-b-[2px] border-[#0EFF7B66]
                           bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126]
                           shadow-[0_2px_12px_0px_#00000040] text-white font-medium text-[14px] leading-[16px]
                           hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CreditCard size={16} />
                    {addPaymentData.generateInvoice ? "Pay & Generate Invoice" : "Add Payment"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ========== MAIN RENDER ==========
  return (
    <div className="w-full max-w-screen-2xl mb-4 mx-auto">
      <div className="mb-4 bg-gray-100 dark:bg-black text-black dark:text-white dark:border-[#1E1E1E] rounded-xl p-6 w-full max-w-[2500px] mx-auto flex flex-col overflow-hidden relative font-[Helvetica]">
        {/* Gradient Backgrounds */}
        <div
          className="absolute inset-0 rounded-[8px] pointer-events-none dark:block hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(3,56,27,0.25) 16%, rgba(15,15,15,0.25) 48.97%)",
            zIndex: 0,
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "10px",
            padding: "2px",
            background:
              "linear-gradient(to bottom right, rgba(14,255,123,0.7) 0%, rgba(30,30,30,0.7) 50%, rgba(14,255,123,0.7) 100%)",
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            pointerEvents: "none",
            zIndex: 0,
          }}
        ></div>
        
        {/* Header */}
        <h2 className="text-xl font-semibold mb-4 text-[#08994A] dark:text-[#0EFF7B]">
          Patient Bill Generation
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
          This is the information for generation of patient bill
        </p>
        
        {/* Search and Patient Selection */}
        <div className="mb-6 flex flex-row justify-end items-center gap-2 flex-wrap max-w-full">
          {/* Search Input with Dropdown Results */}
          <div className="flex-1 min-w-[180px] max-w-[350px] lg:max-w-[400px] relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search patient name or ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="
                  w-full
                  h-[34px]
                  pl-10 pr-4
                  rounded
                  border-[1.05px]
                  border-[#0EFF7B] dark:border-[#0EFF7B1A]
                  bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A]
                  text-[#08994A] dark:text-white
                  placeholder-[#5CD592] dark:placeholder-[#5CD592]
                  focus:outline-none
                  focus:border-[#0EFF7B]
                  transition-all
                  font-helvetica
                "
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0EFF7B] pointer-events-none" />
            </div>
            {searchQuery.trim() && filteredPatients.length > 0 && (
              <div className="absolute mt-1 w-full max-h-60 overflow-auto rounded-[8px] bg-gray-100 dark:bg-black shadow-lg z-50 border border-[#0EFF7B] dark:border-[#3C3C3C]">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => {
                      handlePatientNameChange(patient.name);
                      setSearchQuery("");
                    }}
                    className="cursor-pointer px-3 py-1.5 text-[#08994A] dark:text-white hover:bg-[#0EFF7B1A] dark:hover:bg-[#025126] border-b border-gray-200 dark:border-gray-800 last:border-b-0"
                  >
                    <div className="font-medium">{patient.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {patient.id}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {searchQuery.trim() && filteredPatients.length === 0 && (
              <div className="absolute mt-1 w-full p-3 text-center bg-gray-100 dark:bg-black rounded-[8px] shadow-lg border border-[#0EFF7B] dark:border-[#3C3C3C] text-gray-500 text-sm z-50">
                No patients found
              </div>
            )}
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative min-w-[120px] w-[160px] lg:w-[180px]">
              <Listbox
                value={patientInfo.patientName}
                onChange={handlePatientNameChange}
              >
                <Listbox.Button
                  className="
                    w-full
                    h-[33.5px]
                    rounded-[8.38px]
                    border-[1.05px]
                    border-[#0EFF7B] dark:border-[#3C3C3C]
                    bg-[#F5F6F5] dark:bg-black
                    text-[#08994A] dark:text-white
                    shadow-[0_0_2.09px_#0EFF7B]
                    outline-none
                    focus:border-[#0EFF7B]
                    focus:shadow-[0_0_4px_#0EFF7B]
                    transition-all
                    duration-300
                    px-3
                    pr-8
                    font-helvetica
                    text-sm
                    text-left
                    relative
                  "
                >
                  {patientInfo.patientName || "Select Patient"}
                  <svg
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#08994A] dark:text-[#0EFF7B] pointer-events-none"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 9l6 6 6-6"
                    />
                  </svg>
                </Listbox.Button>
                <Listbox.Options
                  className="
                    absolute
                    z-10
                    mt-1
                    w-full
                    bg-gray-100 dark:bg-black
                    border border-[#0EFF7B] dark:border-[#3C3C3C]
                    rounded-md
                    shadow-lg
                    max-h-60
                    overflow-auto
                    text-sm
                    font-helvetica
                    top-[100%]
                    left-0
                  "
                >
                  {filteredPatients.map((patient) => (
                    <Listbox.Option
                      key={patient.id}
                      value={patient.name}
                      className="
                        cursor-pointer
                        select-none
                        p-2
                        text-[#08994A] dark:text-white
                        hover:bg-[#0EFF7B1A] dark:hover:bg-[#025126]
                      "
                    >
                      {patient.name}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Listbox>
            </div>
          </div>
        </div>
        
        {/* Patient Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {/* Patient Basic Info */}
          <div className="bg-[#F5F6F5] dark:bg-transparent border-[1.05px] border-[#0EFF7B] dark:border-[#0EFF7B1A] shadow-[0px_0px_4px_0px_#0EFF7B40] dark:shadow-[0px_0px_4px_0px_#FFFFFF1F] rounded-xl p-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Patient ID
              </label>
              <input
                type="text"
                className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
                value={patientInfo.patientID}
                readOnly
              />
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Patient Name
              </label>
              <input
                type="text"
                className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
                value={patientInfo.patientName}
                readOnly
              />
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Age/Gender
              </label>
              <input
                type="text"
                className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
                value={patientInfo.ageGender}
                readOnly
              />
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Admission Start
              </label>
              <input
                type="text"
                className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
                value={patientInfo.startDate}
                readOnly
              />
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Admission End
              </label>
              <input
                type="text"
                className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
                value={patientInfo.endDate}
                readOnly
              />
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Date of Birth
              </label>
              <input
                type="text"
                className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
                value={patientInfo.dateOfBirth}
                readOnly
              />
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Address
              </label>
              <input
                type="text"
                className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
                value={patientInfo.address}
                readOnly
              />
            </div>
          </div>
          
          {/* Medical and Payment Info */}
          <div className="bg-[#F5F6F5] dark:bg-transparent border-[1.05px] border-[#0EFF7B] dark:border-[#0EFF7B1A] shadow-[0px_0px_4px_0px_#0EFF7B40] dark:shadow-[0px_0px_4px_0px_#FFFFFF1F] rounded-xl p-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Room Type
              </label>
              <input
                type="text"
                className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
                value={patientInfo.roomType}
                readOnly
              />
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Doctor Name
              </label>
              <input
                type="text"
                className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
                value={patientInfo.doctorName}
                readOnly
              />
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Department
              </label>
              <input
                type="text"
                className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
                value={patientInfo.department}
                readOnly
              />
              
              {/* Payment Mode Field */}
<label className="text-sm text-gray-600 dark:text-gray-300">
  Payment mode <span className="text-red-500">*</span>
</label>
<div className="relative">
  <Listbox
    value={patientInfo.paymentMode}
    onChange={(value) => {
      handleInputChange(value, "paymentMode");
      if (value && value.trim() !== "") {
        setValidationErrors(prev => ({ ...prev, paymentMode: "" }));
      }
    }}
  >
    <Listbox.Button
      className="
        w-full
        h-[33.5px]
        rounded-[8.38px]
        border-[1.05px]
        border-[#0EFF7B] dark:border-[#3C3C3C]
        bg-[#F5F6F5] dark:bg-black
        text-[#08994A] dark:text-white
        shadow-[0_0_2.09px_#0EFF7B]
        outline-none
        focus:border-[#0EFF7B]
        focus:shadow-[0_0_4px_#0EFF7B]
        transition-all
        duration-300
        px-3
        pr-8
        font-helvetica
        text-sm
        text-left
        relative
      "
    >
      {patientInfo.paymentMode || "Select Mode"}
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#08994A] dark:text-[#0EFF7B] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 9l6 6 6-6"
        />
      </svg>
    </Listbox.Button>
    <Listbox.Options
      className="
        absolute
        z-10
        mt-1
        w-full
        bg-gray-100 dark:bg-black
        border border-[#0EFF7B] dark:border-[#3C3C3C]
        rounded-md
        shadow-lg
        max-h-60
        overflow-auto
        text-sm
        font-helvetica
        top-[100%]
        left-0
      "
    >
      {paymentModes.map((mode) => (
        <Listbox.Option
          key={mode}
          value={mode}
          className="
            cursor-pointer
            select-none
            p-2
            text-[#08994A] dark:text-white
            hover:bg-[#0EFF7B1A] dark:hover:bg-[#025126]
          "
        >
          {mode}
        </Listbox.Option>
      ))}
    </Listbox.Options>
  </Listbox>
  {validationErrors.paymentMode && (
    <p className="text-red-500 text-xs mt-1">{validationErrors.paymentMode}</p>
  )}
</div>

{/* Payment Type Field */}
<label className="text-sm text-gray-600 dark:text-gray-300">
  Payment Type <span className="text-red-500">*</span>
</label>
<div className="relative">
  <Listbox
    value={patientInfo.paymentType}
    onChange={(value) => {
      handleInputChange(value, "paymentType");
      if (value && value.trim() !== "") {
        setValidationErrors(prev => ({ ...prev, paymentType: "" }));
      }
    }}
  >
    <Listbox.Button
      className="
        w-full h-[33.5px] rounded-[8.38px]
        border-[1.05px] border-[#0EFF7B] dark:border-[#3C3C3C]
        bg-[#F5F6F5] dark:bg-black
        text-[#08994A] dark:text-white
        shadow-[0_0_2.09px_#0EFF7B]
        outline-none
        focus:border-[#0EFF7B] focus:shadow-[0_0_4px_#0EFF7B]
        transition-all duration-300
        px-3 pr-8 font-helvetica text-sm text-left relative
      "
    >
      {patientInfo.paymentType || "Select Type"}
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#08994A] dark:text-[#0EFF7B] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 9l6 6 6-6"
        />
      </svg>
    </Listbox.Button>
    <Listbox.Options
      className="
        absolute z-10 mt-1 w-full bg-gray-100 dark:bg-black
        border border-[#0EFF7B] dark:border-[#3C3C3C]
        rounded-md shadow-lg max-h-60 overflow-auto
        text-sm font-helvetica top-[100%] left-0
      "
    >
      {paymentTypes.map((type) => (
        <Listbox.Option
          key={type}
          value={type}
          className="
            cursor-pointer select-none p-2
            text-[#08994A] dark:text-white
            hover:bg-[#0EFF7B1A] dark:hover:bg-[#025126]
          "
        >
          {type}
        </Listbox.Option>
      ))}
    </Listbox.Options>
  </Listbox>
  {validationErrors.paymentType && (
    <p className="text-red-500 text-xs mt-1">{validationErrors.paymentType}</p>
  )}
</div>

{/* Payment Status Field */}
<label className="text-sm text-gray-600 dark:text-gray-300">
  Payment Status <span className="text-red-500">*</span>
</label>
<div className="relative">
  <Listbox
    value={patientInfo.paymentStatus}
    onChange={(value) => {
      handleInputChange(value, "paymentStatus");
      if (value && value.trim() !== "") {
        setValidationErrors(prev => ({ ...prev, paymentStatus: "" }));
      }
    }}
  >
    <Listbox.Button
      className="
        w-full h-[33.5px] rounded-[8.38px]
        border-[1.05px] border-[#0EFF7B] dark:border-[#3C3C3C]
        bg-[#F5F6F5] dark:bg-black
        text-[#08994A] dark:text-white
        shadow-[0_0_2.09px_#0EFF7B]
        outline-none
        focus:border-[#0EFF7B] focus:shadow-[0_0_4px_#0EFF7B]
        transition-all duration-300
        px-3 pr-8 font-helvetica text-sm text-left relative
      "
    >
      {patientInfo.paymentStatus || "Select Status"}
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#08994A] dark:text-[#0EFF7B] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 9l6 6 6-6"
        />
      </svg>
    </Listbox.Button>
    <Listbox.Options
      className="
        absolute z-10 mt-1 w-full bg-gray-100 dark:bg-black
        border border-[#0EFF7B] dark:border-[#3C3C3C]
        rounded-md shadow-lg max-h-60 overflow-auto
        text-sm font-helvetica top-[100%] left-0
      "
    >
      {paymentStatuses.map((status) => (
        <Listbox.Option
          key={status}
          value={status}
          className="
            cursor-pointer select-none p-2
            text-[#08994A] dark:text-white
            hover:bg-[#0EFF7B1A] dark:hover:bg-[#025126]
          "
        >
          {status}
        </Listbox.Option>
      ))}
    </Listbox.Options>
  </Listbox>
  {validationErrors.paymentStatus && (
    <p className="text-red-500 text-xs mt-1">{validationErrors.paymentStatus}</p>
  )}
</div>
            </div>
          </div>
          
          {/* Staff and Insurance Info */}
          <div className="bg-[#F5F6F5] dark:bg-transparent border-[1.05px] border-[#0EFF7B] dark:border-[#0EFF7B1A] shadow-[0px_0px_4px_0px_#0EFF7B40] dark:shadow-[0px_0px_4px_0px_#FFFFFF1F] rounded-xl p-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Billing Staff
              </label>
              <input
                type="text"
                className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
                value={patientInfo.billingStaff}
                readOnly
              />
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Billing Staff ID
              </label>
              <input
                type="text"
                className="bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-md p-1 text-sm text-[#08994A] dark:text-white"
                value={patientInfo.billingStaffID}
                readOnly
              />
            </div>
            
            {/* Insurance Section */}
            <div
              className="col-span-2 mt-4 p-2 rounded-[10px] flex flex-col gap-4"
              style={{
                border: "1.05px solid #3C3C3C",
                boxShadow: "0px 0px 2.09px 0px #0EFF7B",
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Is this bill being processed with Insurance?
                </span>
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">Yes</span>
                    <Switch
                      checked={isInsurance}
                      onChange={setIsInsurance}
                      className={`${
                        isInsurance ? "bg-[#0EFF7B]" : "bg-gray-600"
                      } relative inline-flex h-5 w-10 items-center rounded-full transition-colors`}
                    >
                      <span
                        className={`${
                          isInsurance ? "translate-x-6" : "translate-x-1"
                        } inline-block h-3 w-3 transform rounded-full bg-gray-100 transition`}
                      />
                    </Switch>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">No</span>
                    <Switch
                      checked={!isInsurance}
                      onChange={(checked) => setIsInsurance(!checked)}
                      className={`${
                        !isInsurance ? "bg-[#0EFF7B]" : "bg-gray-600"
                      } relative inline-flex h-5 w-10 items-center rounded-full transition-colors`}
                    >
                      <span
                        className={`${
                          !isInsurance ? "translate-x-6" : "translate-x-1"
                        } inline-block h-3 w-3 transform rounded-full bg-gray-100 transition`}
                      />
                    </Switch>
                  </div>
                  {isInsurance && (
                    <button
                      onClick={() => {
                        setEditingIndex(null);
                        setModalData(emptyModal);
                        setShowModal(true);
                      }}
                      className="text-[#0EFF7B] underline cursor-pointer text-sm whitespace-nowrap"
                      style={{ alignSelf: "center" }}
                    >
                      If yes, Add insurance
                    </button>
                  )}
                </div>
              </div>
              {isInsurance && insurances.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm text-left min-w-[600px]">
                    <thead className="text-[#08994A] dark:text-[#0EFF7B] bg-gray-200 dark:bg-[#091810]">
                      <tr>
                        <th className="p-2">Provider</th>
                        <th className="p-2">Policy Number</th>
                        <th className="p-2">Valid From</th>
                        <th className="p-2">Valid To</th>
                        <th className="p-2">Policy Card</th>
                        <th className="p-2">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-[#08994A] dark:text-gray-300 bg-gray-100 dark:bg-black">
                      {insurances.map((ins, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-300 dark:border-gray-800 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B0D]"
                        >
                          <td className="p-2">{ins.provider}</td>
                          <td className="p-2">{ins.policyNum}</td>
                          <td className="p-2">{ins.validFrom}</td>
                          <td className="p-2">{ins.validTo}</td>
                          <td className="p-2">{ins.policyCard}</td>
                          <td className="p-2 flex gap-2">
                            <Pencil
                              className="w-5 h-5 text-[#0EFF7B] cursor-pointer"
                              onClick={() => handleEditInsurance(index)}
                            />
                            <Trash
                              className="w-5 h-5 text-red-500 cursor-pointer"
                              onClick={() => handleDeleteInsurance(index)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Billing Items Section */}
        <div className="bg-[#F5F6F5] dark:bg-transparent border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[#08994A] dark:text-[#0EFF7B]">
              Treatment & charges
            </h3>
            <div className="flex items-center gap-4">
              {/* Add Item Button - Moved to right side */}
              {invoiceGenerationType === "current" && (
                <button
                  onClick={handleAddBillingItem}
                  disabled={!patientInfo.patientID}
                  className={`flex items-center justify-center border-b-[2px] border-[#0EFF7B] gap-2 w-[200px] h-[40px] rounded-[8px] ${
                    patientInfo.patientID 
                      ? "bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] text-white hover:scale-105" 
                      : "bg-gray-300 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  } font-medium text-[14px] transition`}
                >
                  <Plus size={18} className={patientInfo.patientID ? "text-white" : "text-gray-400"} />
                  Add Item
                </button>
              )}
              {/* Invoice Generation Type Dropdown */}
              <div className="relative min-w-[180px]">
                <Listbox
                  value={invoiceGenerationType}
                  onChange={handleInvoiceGenerationTypeChange}
                >
                  <Listbox.Button
                    className="
                      w-full
                      h-[33.5px]
                      rounded-[8.38px]
                      border-[1.05px]
                      border-[#0EFF7B] dark:border-[#3C3C3C]
                      bg-[#F5F6F5] dark:bg-black
                      text-[#08994A] dark:text-white
                      shadow-[0_0_2.09px_#0EFF7B]
                      outline-none
                      focus:border-[#0EFF7B]
                      focus:shadow-[0_0_4px_#0EFF7B]
                      transition-all
                      duration-300
                      px-3
                      pr-8
                      font-helvetica
                      text-sm
                      text-left
                      relative
                    "
                  >
                    {invoiceGenerationOptions.find(opt => opt.value === invoiceGenerationType)?.label || "Current Invoice"}
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#08994A] dark:text-[#0EFF7B] pointer-events-none"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 9l6 6 6-6"
                      />
                    </svg>
                  </Listbox.Button>
                  <Listbox.Options
                    className="
                      absolute
                      z-10
                      mt-1
                      w-full
                      bg-gray-100 dark:bg-black
                      border border-[#0EFF7B] dark:border-[#3C3C3C]
                      rounded-md
                      shadow-lg
                      max-h-60
                      overflow-auto
                      text-sm
                      font-helvetica
                      top-[100%]
                      left-0
                    "
                  >
                    {invoiceGenerationOptions.map((option) => (
                      <Listbox.Option
                        key={option.value}
                        value={option.value}
                        className="
                          cursor-pointer
                          select-none
                          p-2
                          text-[#08994A] dark:text-white
                          hover:bg-[#0EFF7B1A] dark:hover:bg-[#025126]
                        "
                      >
                        {option.label}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Listbox>
              </div>
            </div>
          </div>
          
          {/* Billing Items Table - Only show for current invoice */}
          {invoiceGenerationType === "current" && (
            <>
              <table className="w-full text-sm text-left">
                <thead className="text-[#08994A] dark:text-[#0EFF7B] bg-gray-200 dark:bg-[#091810]">
                  <tr>
                    <th className="p-2 w-24">S No</th>
                    <th className="p-2">Description</th>
                    <th className="p-2 w-32">Quantity</th>
                    <th className="p-2 w-32">Unit price ($)</th>
                    <th className="p-2 w-32">Disc %</th>
                    <th className="p-2 w-32">Tax %</th>
                    <th className="p-2 w-32">Amount ($)</th>
                  </tr>
                </thead>
                <tbody className="text-[#08994A] dark:text-gray-300 bg-gray-100 dark:bg-black">
                  {renderBillingTableContent()}
                </tbody>
              </table>
              
              {/* Partial Payment Section - ONLY in current invoice tab */}
              {renderPartialPaymentSection()}
              
              {/* Partial Invoices Section - Now with checkboxes */}
              {renderPartialInvoicesSection()}
            </>
          )}
          
          {/* Consolidate Invoices Section */}
          {invoiceGenerationType === "consolidate" && renderConsolidateInvoicesSection()}
        
          {/* Payment Summary Card - NEW - Only show for current invoice */}
          {invoiceGenerationType === "current" && (billingItems.length > 0 || selectedPartialInvoices.length > 0) && (
            <div className="mt-6 p-4 border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-lg bg-gradient-to-r from-[#0EFF7B0A] to-[#0251261A]">
              <h4 className="text-[#08994A] dark:text-[#0EFF7B] font-medium mb-3 flex items-center gap-2">
                <DollarSign size={20} />
                Payment Summary
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-[#F5F6F5] dark:bg-black/50 rounded-lg border border-[#0EFF7B33]">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={18} className="text-[#08994A] dark:text-[#0EFF7B]" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">New Charges</span>
                  </div>
                  <div className="text-2xl font-bold text-[#08994A] dark:text-[#0EFF7B]">
                    ${formattedNewChargesSubtotal}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Before tax & discount
                  </div>
                </div>
                
                <div className="p-3 bg-[#F5F6F5] dark:bg-black/50 rounded-lg border border-[#0EFF7B33]">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={18} className="text-orange-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pending Amount</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-500">
                    ${formattedSelectedPartialTotal}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    From {selectedPartialInvoices.length} selected invoice(s)
                  </div>
                </div>
                
                <div className="p-3 bg-gradient-to-r from-[#025126] to-[#0D7F41] rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard size={18} className="text-white" />
                    <span className="text-sm font-medium text-white">Total Payable</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    ${formattedTotalPayable}
                  </div>
                  <div className="text-xs text-white/80 mt-1">
                    New charges after tax + pending
                  </div>
                </div>
              </div>
            </div>
          )}
        
          {/* Total and Action Buttons */}
<div className="flex justify-end items-center mt-6 pr-4 gap-4 w-full overflow-x-hidden no-scrollbar">
  {invoiceGenerationType === "current" ? (
    // Current Invoice Total Display - Show appropriate totals based on payment type
    <div
      className="flex items-center border border-[#0EFF7B] rounded-[8px] overflow-hidden min-w-[500px] max-w-[800px] w-auto"
      style={{
        height: billingItems.length > 0 || selectedPartialInvoices.length > 0 ? "103px" : "103px",
        backgroundColor: "#0B0B0B",
      }}
    >
      {billingItems.length > 0 || selectedPartialInvoices.length > 0 ? (
        <>
          {/* Left section - Flexible width */}
          <div className="flex flex-col justify-center flex-1 min-w-[250px] pl-5 pr-4 py-3 text-sm font-medium text-white">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard size={18} className="text-[#0EFF7B]" />
              <span className="text-white text-base whitespace-nowrap">
                {patientInfo.paymentType === "Partial Payment" ? "Partial Bill" : "Total Payable"}
              </span>
            </div>
            
            {/* For Partial Payment - Show compact breakdown */}
            {patientInfo.paymentType === "Partial Payment" && billingItems.length > 0 ? (
              <div className="flex flex-col">
                <div className="text-xl font-bold text-[#0EFF7B]">
                  ${formattedGrand}
                </div>
                <div className="flex gap-3 text-xs mt-1">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">Paid:</span>
                    <span className="text-green-500 font-semibold">${parseFloat(partialPaymentData.paidAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">Due:</span>
                    <span className="text-orange-500 font-semibold">${formattedPending}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">By:</span>
                    <span className="text-white text-xs">{partialPaymentData.dueDate ? partialPaymentData.dueDate.split('-').slice(1).join('/') : '—'}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Regular Total Payable Display */
              <>
                <div className="text-2xl font-bold text-[#0EFF7B]">
                  ${formattedTotalPayable}
                </div>
                {billingItems.length > 0 && (
                  <div className="text-xs text-gray-400 mt-1 truncate max-w-[250px]">
                    New: ${formattedGrand}
                    {selectedPartialInvoices.length > 0 && ` + Pending: $${formattedSelectedPartialTotal}`}
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Divider */}
          <div
            className="h-full w-[2px] flex-shrink-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(14,255,123,0.1) 0%, #0EFF7B 50%, rgba(14,255,123,0.1) 100%)",
            }}
          ></div>
          
          {/* Right section - Fixed width */}
          <div className="flex flex-col justify-center px-4 py-3 bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] text-right h-full min-w-[130px] flex-shrink-0">
            <span className="text-white text-xs font-semibold whitespace-nowrap">
              {patientInfo.paymentType === "Partial Payment" ? "Due Amount" : "Amount Due"}
            </span>
            <span className="text-[#0EFF7B] text-lg font-bold">
              {patientInfo.paymentType === "Partial Payment" 
                ? `$${formattedPending}`
                : `$${formattedTotalPayable}`
              }
            </span>
            <span className="text-white text-[10px] leading-tight mt-0.5">
              {patientInfo.paymentType === "Partial Payment"
                ? "Balance due"
                : billingItems.length > 0 && selectedPartialInvoices.length > 0 
                ? "New + Pending"
                : billingItems.length > 0 
                ? "New charges" 
                : "Pending only"
              }
            </span>
          </div>
        </>
      ) : (
        // Show placeholder if no billing items and no selected invoices
        <>
          <div className="flex flex-col justify-center flex-1 min-w-[200px] pl-5 pr-4 py-3 text-sm font-medium text-white">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard size={18} className="text-[#0EFF7B]" />
              <span className="text-white text-base">Total Payable</span>
            </div>
            <div className="text-2xl font-bold text-[#0EFF7B]">
              $0.00
            </div>
          </div>
          <div
            className="h-full w-[2px] flex-shrink-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(14,255,123,0.1) 0%, #0EFF7B 50%, rgba(14,255,123,0.1) 100%)",
            }}
          ></div>
          <div className="flex flex-col justify-center px-4 py-3 bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] text-right h-full min-w-[130px] flex-shrink-0">
            <span className="text-white text-xs font-semibold">Amount Due</span>
            <span className="text-[#0EFF7B] text-lg font-bold">$0.00</span>
          </div>
        </>
      )}
    </div>
  ) : (
    // Consolidate Invoice Total Display (unchanged)
    <div
      className="flex items-center border border-[#0EFF7B] rounded-[8px] overflow-hidden min-w-[404.31px] max-w-[744.31px]"
      style={{
        height: "103px",
        backgroundColor: "#0B0B0B",
      }}
    >
      <div className="flex flex-col justify-center flex-1 pl-5 pr-6 py-3 text-sm font-medium text-white gap-2">
        <div className="flex justify-between w-full">
          <span>Selected Invoices:</span>
          <span className="text-[#FFB100] font-semibold">
            {selectedConsolidateInvoices.length} / {availablePaidInvoices.length}
          </span>
        </div>
        <div className="flex justify-between w-full">
          <span>Total Amount:</span>
          <span className="text-[#FFB100] font-semibold">
            ${formattedConsolidateTotal}
          </span>
        </div>
      </div>
      <div
        className="h-full w-[2px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(14,255,123,0.1) 0%, #0EFF7B 50%, rgba(14,255,123,0.1) 100%)",
        }}
      ></div>
      <div className="flex flex-col justify-center px-6 py-3 bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126] text-right h-full min-w-[120px]">
        <span className="text-white text-sm font-semibold">Total</span>
        <span className="text-[#0EFF7B] text-lg font-bold">
          ${formattedConsolidateTotal}
        </span>
      </div>
    </div>
  )}
  
  {/* Button section remains the same */}
  <div className="flex items-center gap-3 flex-nowrap">
    <button
      className="text-white border border-[#0EFF7B] rounded-[10px] text-sm font-medium transition-transform hover:scale-105 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
      style={{
        width: invoiceGenerationType === "consolidate" ? "256px" : "256px",
        height: "50px",
        paddingTop: "4px",
        paddingRight: "12px",
        paddingBottom: "4px",
        paddingLeft: "12px",
        gap: "4px",
        background:
          "linear-gradient(90deg, #025126 0%, #0D7F41 50%, #025126 100%)",
      }}
      disabled={
        (generatingBill || generatingConsolidateInvoice || loading) ||
        (invoiceGenerationType === "consolidate" && selectedConsolidateInvoices.length === 0) ||
        (invoiceGenerationType === "current" && billingItems.length === 0 && selectedPartialInvoices.length === 0)
      }
      onClick={handleGenerateBill}
    >
      {generatingBill ? (
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating Invoice...
        </div>
      ) : generatingConsolidateInvoice ? (
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating Consolidate...
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Processing...
        </div>
      ) : payPendingInvoice ? (
        <div className="flex items-center justify-center gap-2">
          <CheckCircle size={16} />
          Pay Pending Invoice
        </div>
      ) : invoiceGenerationType === "consolidate" ? (
        <div className="flex items-center justify-center gap-2">
          <Receipt size={16} />
          Generate Consolidate Invoice
        </div>
      ) : billingItems.length === 0 && selectedPartialInvoices.length > 0 ? (
        <div className="flex items-center justify-center gap-2">
          <CheckCircle size={16} />
          Pay Selected Invoices (${formattedSelectedPartialTotal})
        </div>
      ) : patientInfo.paymentType === "Partial Payment" ? (
        <div className="flex items-center justify-center gap-2">
          <Receipt size={16} />
          Partial Invoice (${parseFloat(partialPaymentData.paidAmount || 0).toLocaleString()} paid)
        </div>
      ) : (
        "Generate Invoice"
      )}
    </button>
  </div>
</div>
        </div>
      </div>
      
      {/* Insurance Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 font-[Helvetica] overflow-y-auto py-4">
          <div
            className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F]
                       bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70
                       dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]
                       overflow-visible my-4"
          >
            <div
              className="w-[505px] rounded-[19px] bg-gray-100 dark:bg-[#000000]
                         text-black dark:text-white p-6 relative overflow-visible"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              <div className="flex justify-between items-center pb-3 mb-4">
                <h3 className="text-black dark:text-white font-medium text-[16px] leading-[19px]">
                  {editingIndex !== null ? "Edit Insurance" : "Add Insurance"}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingIndex(null);
                    setModalData(emptyModal);
                  }}
                  className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center"
                >
                  <X size={16} className="text-black dark:text-white" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-black dark:text-white block mb-1">
                    Insurance Provider
                  </label>
                  <Listbox
                    value={modalData.provider}
                    onChange={(v) =>
                      setModalData({ ...modalData, provider: v })
                    }
                  >
                    <div className="relative mt-1">
                      <Listbox.Button
                        className="w-full h-[33px] px-3 pr-8 rounded-[8px] border bg-gray-100 dark:bg-transparent 
                                   text-left text-[14px] leading-[16px] flex items-center justify-between group
                                   border-[#0EFF7B] dark:border-[#3A3A3A]"
                        style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                      >
                        <span className={`block truncate ${modalData.provider ? "text-black dark:text-[#0EFF7B]" : "text-[#0EFF7B] dark:text-[#0EFF7B]"}`}>
                          {modalData.provider || "Select Provider"}
                        </span>
                        <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                          <ChevronDown className="h-4 w-4 text-[#0EFF7B]" />
                        </span>
                      </Listbox.Button>
                      <Listbox.Options
                        className="absolute mt-0.5 w-full max-h-40 overflow-y-auto rounded-[12px] bg-gray-100 dark:bg-black
                                   shadow-lg z-50 border border-[#0EFF7B] dark:border-[#3A3A3A] left-[2px]"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                      >
                        {providers.map((prov) => (
                          <Listbox.Option
                            key={prov}
                            value={prov}
                            className={({ active, selected }) =>
                              `cursor-pointer select-none py-2 px-2 text-sm rounded-md
                               ${
                                 active
                                   ? "bg-[#0EFF7B33] text-[#0EFF7B]"
                                   : "text-black dark:text-white"
                               }
                               ${selected ? "font-medium text-[#0EFF7B]" : ""}`
                            }
                            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                          >
                            {prov}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>
                <div>
                  <label className="text-sm text-black dark:text-white block mb-1">
                    Policy Number
                  </label>
                  <input
                    type="text"
                    value={modalData.policyNum}
                    onChange={(e) =>
                      setModalData({ ...modalData, policyNum: e.target.value })
                    }
                    placeholder="enter policy number"
                    className="w-full h-[33px] mt-1 px-3 rounded-[8px] border bg-gray-100 dark:bg-transparent 
                               placeholder-gray-400 dark:placeholder-gray-500 outline-none 
                               text-black dark:text-[#0EFF7B] border-[#0EFF7B] dark:border-[#3A3A3A]"
                  />
                </div>
                <div>
                  <label className="text-sm text-black dark:text-white block mb-1">
                    Valid From
                  </label>
                  <div className="relative mt-1">
                    <DatePicker
                      selected={
                        modalData.validFrom
                          ? new Date(modalData.validFrom)
                          : null
                      }
                      onChange={(date) =>
                        setModalData({ ...modalData, validFrom: date })
                      }
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Select date"
                      maxDate={new Date()}
                      className="w-full h-[33px] px-3 pr-10 rounded-[8px] border bg-gray-100 dark:bg-transparent 
                                 placeholder-gray-400 dark:placeholder-gray-500 outline-none 
                                 text-black dark:text-[#0EFF7B] border-[#0EFF7B] dark:border-[#3A3A3A]"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0EFF7B] pointer-events-none w-4 h-4" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-black dark:text-white block mb-1">
                    Valid To
                  </label>
                  <div className="relative mt-1">
                    <DatePicker
                      selected={
                        modalData.validTo ? new Date(modalData.validTo) : null
                      }
                      onChange={(date) =>
                        setModalData({ ...modalData, validTo: date })
                      }
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Select date"
                      minDate={new Date()}
                      className="w-full h-[33px] px-3 pr-10 rounded-[8px] border bg-gray-100 dark:bg-transparent 
                                 placeholder-gray-400 dark:placeholder-gray-500 outline-none 
                                 text-black dark:text-[#0EFF7B] border-[#0EFF7B] dark:border-[#3A3A3A]"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0EFF7B] pointer-events-none w-4 h-4" />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-black dark:text-white block mb-1">
                    Upload Policy Card
                  </label>
                  <input
                    type="file"
                    accept=".jpg,.png,.jpeg,.pdf"
                    onChange={(e) =>
                      setModalData({
                        ...modalData,
                        policyCard: e.target.files[0],
                      })
                    }
                    className="w-full h-[33px] px-3 py-1 rounded-[8px] border bg-gray-100 dark:bg-transparent 
                               text-black dark:text-[#0EFF7B] border-[#0EFF7B] dark:border-[#3A3A3A]
                               file:mr-4 file:py-1 file:px-3 file:rounded-[6px] file:border-0
                               file:text-sm file:font-medium file:bg-[#0EFF7B1A] file:text-[#08994A] dark:file:text-[#0EFF7B]
                               hover:file:bg-[#0EFF7B33] cursor-pointer"
                  />
                  {modalData.policyCard && (
                    <p className="text-xs mt-1 text-green-500 dark:text-[#0EFF7B]">
                      Selected: {modalData.policyCard.name || modalData.policyCard}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingIndex(null);
                    setModalData(emptyModal);
                  }}
                  className="w-[144px] h-[34px] rounded-[8px] py-2 px-1 border border-[#0EFF7B] dark:border-gray-600
                             text-gray-600 dark:text-white font-medium text-[14px] leading-[16px]
                             shadow-[0_2px_12px_0px_#00000040] bg-gray-100 dark:bg-transparent"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddOrUpdateInsurance}
                  className="w-[144px] h-[32px] rounded-[8px] py-2 px-3 border-b-[2px] border-[#0EFF7B66]
                             bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126]
                             shadow-[0_2px_12px_0px_#00000040] text-white font-medium text-[14px] leading-[16px]
                             hover:scale-105 transition flex items-center justify-center gap-2"
                >
                  {editingIndex !== null ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Partial Payment Modal */}
      {renderAddPaymentModal()}

      {/* Pay Pending Invoice Modal */}
      {renderPayPendingInvoiceModal()}
    </div>
  );
};

export default BillingPreview;