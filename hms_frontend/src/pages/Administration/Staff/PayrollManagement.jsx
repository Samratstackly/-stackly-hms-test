import React, { useState } from 'react';
import { Listbox } from '@headlessui/react';
import { Search, Filter, Trash2, ChevronLeft, ChevronRight, Share2, X } from 'lucide-react';

const PayrollManagement = () => {
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [payPeriod, setPayPeriod] = useState('Mar 2025');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const itemsPerPage = 5;

  const employees = [
    { id: 1, name: 'Dr. John Smith', department: 'Cardiology', role: 'Cardiologist', amount: '$1,000.00', date: 'Aug 2025', status: 'Paid' },
    { id: 2, name: 'Dr. Lisa Brown', department: 'Radiology', role: 'Radiologist', amount: '$800.50', date: 'Aug 2025', status: 'Paid' },
    { id: 3, name: 'Dr. Ethan Clark', department: 'Radiology', role: 'Radiologist', amount: '$900.50', date: 'Aug 2025', status: 'Paid' },
    { id: 4, name: 'Dr. Sarah Wilson', department: 'Oncology', role: 'Oncologist', amount: '$1,075.00', date: 'Aug 2025', status: 'Unpaid' },
    { id: 5, name: 'Dr. William Jones', department: 'Emergency', role: 'Emergency Physician', amount: '$1,050.00', date: 'Aug 2025', status: 'Unpaid' },
    { id: 6, name: 'Dr. Olivia Taylor', department: 'Neurology', role: 'Neurologist', amount: '$975.25', date: 'Aug 2025', status: 'Pending' },
    { id: 7, name: 'Dr. Michael Davis', department: 'Orthopedics', role: 'Orthopedist', amount: '$950.00', date: 'Aug 2025', status: 'Paid' },
    { id: 8, name: 'Dr. Emma Rodriguez', department: 'Dermatology', role: 'Dermatologist', amount: '$850.00', date: 'Aug 2025', status: 'Failed' },
    { id: 9, name: 'Dr. James Miller', department: 'Pediatrics', role: 'Pediatrician', amount: '$1,200.00', date: 'Aug 2025', status: 'Pending' },
    { id: 10, name: 'Dr. Sophia Garcia', department: 'General Surgery', role: 'Surgeon', amount: '$900.00', date: 'Aug 2025', status: 'Paid' },
  ];

  const departments = ['All Departments', 'Cardiology', 'Radiology', 'Oncology', 'Emergency', 'Neurology', 'Orthopedics', 'Dermatology', 'Pediatrics', 'General Surgery'];
  const roles = ['All Roles', 'Cardiologist', 'Radiologist', 'Oncologist', 'Emergency Physician', 'Neurologist', 'Orthopedist', 'Dermatologist', 'Pediatrician', 'Surgeon'];
  const payPeriods = ['Mar 2025', 'Jul 2025', 'Jun 2025'];
  const statusOptions = ['All Status', 'Paid', 'Unpaid', 'Pending', 'Failed'];

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (department === '' || emp.department === department) &&
    (role === '' || emp.role === role) &&
    (statusFilter === '' || emp.status === statusFilter)
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSelect = (id) => {
    setSelectedEmployees(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedEmployees(filteredEmployees.map(emp => emp.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100';
      case 'Unpaid': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100';
      case 'Pending': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100';
      case 'Failed': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100';
      default: return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100';
    }
  };

  const handleFilter = () => {
    setShowFilterModal(true);
  };

  const handleDelete = () => {
    if (selectedEmployees.length > 0) {
      setShowDeleteModal(true);
    }
  };

  const confirmDelete = () => {
    // Simulate delete: remove selected from employees (in real app, API call)
    console.log('Deleted employees:', selectedEmployees);
    setSelectedEmployees([]);
    setShowDeleteModal(false);
    // In real implementation, update the main data source
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  const closeFilterModal = () => {
    setShowFilterModal(false);
  };

  const confirmFilter = () => {
    // Apply additional filters if needed
    console.log('Filter applied');
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setDepartment('');
    setRole('');
    setStatusFilter('');
    setSearchTerm('');
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="p-4 bg-gray-100 dark:bg-black text-black dark:text-white min-h-screen font-[Helvetica]">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-black dark:text-white">Payroll Management</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-100 dark:bg-black border border-[#3C3C3C] p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-[#FFFFFF]">This Month's Payroll</div>
          <div className="text-2xl font-bold text-[#08994A]">$1,200,000</div>
        </div>
        <div className="bg-gray-100 dark:bg-black border border-[#3C3C3C] p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-[#FFFFFF]">Employees Paid</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">90/100</div>
        </div>
        <div className="bg-gray-100 dark:bg-black border border-[#3C3C3C] p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">8</div>
        </div>
        <div className="bg-gray-100 dark:bg-black border border-[#3C3C3C] p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">2</div>
        </div>
      </div>

      {/* Header with filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-black dark:text-white text-base font-medium">All Payment</h2>
          <p className="text-[#A0A0A0] text-sm">List of all payments</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
  {/* Department */}
  <div className="relative">
    <p className="text-black dark:text-white text-sm mb-1">Department</p>
    <Listbox value={department} onChange={setDepartment}>
      <div className="relative">
        <Listbox.Button className="flex items-center justify-between w-[228px] h-[42px] border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[8px] px-[12px] py-[8px] text-sm text-[#08994A] dark:text-white bg-[#F5F6F5] dark:bg-black">
          <span className="truncate">{department || 'Select Departments'}</span>
          <svg
            className="h-4 w-4 text-[#08994A] dark:text-[#0EFF7B]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Listbox.Button>
        <Listbox.Options 
          className="absolute z-10 mt-1 w-full max-h-60 overflow-auto border border-[#0EFF7B] dark:border-[#3C3C3C] bg-gray-100 dark:bg-black rounded-md shadow-lg scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {departments.map((dept) => (
            <Listbox.Option
              key={dept}
              value={dept === 'All Departments' ? '' : dept}
              className={({ active }) => 
                `px-[12px] py-[8px] text-sm text-[#08994A] dark:text-white cursor-pointer ${
                  active ? 'bg-[#0EFF7B1A] dark:bg-[#0EFF7B33]' : ''
                }`
              }
            >
              {dept}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  </div>

  {/* Specialist */}
  <div className="relative">
    <p className="text-black dark:text-white text-sm mb-1">Specialist</p>
    <Listbox value={role} onChange={setRole}>
      <div className="relative">
        <Listbox.Button className="flex items-center justify-between w-[228px] h-[42px] border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[8px] px-[12px] py-[8px] text-sm text-[#08994A] dark:text-white bg-[#F5F6F5] dark:bg-black">
          <span className="truncate">{role || 'Select Roles'}</span>
          <svg
            className="h-4 w-4 text-[#08994A] dark:text-[#0EFF7B]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Listbox.Button>
        <Listbox.Options 
          className="absolute z-10 mt-1 w-full max-h-60 overflow-auto border border-[#0EFF7B] dark:border-[#3C3C3C] bg-gray-100 dark:bg-black rounded-md shadow-lg scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {roles.map((rl) => (
            <Listbox.Option
              key={rl}
              value={rl === 'All Roles' ? '' : rl}
              className={({ active }) => 
                `px-[12px] py-[8px] text-sm text-[#08994A] dark:text-white cursor-pointer ${
                  active ? 'bg-[#0EFF7B1A] dark:bg-[#0EFF7B33]' : ''
                }`
              }
            >
              {rl}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  </div>
</div>
      </div>

      {/* Table Container */}
      <div className="w-full bg-gray-100 dark:bg-transparent rounded-xl p-4 md:p-6 overflow-x-auto border border-[#0EFF7B] dark:border-[#3C3C3C]">
        {/* Search + Filter + Delete - Separated */}
        <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
          <span className="text-black dark:text-white text-base font-medium">All Invoices</span>
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] outline-none text-sm  flex-1 min-w-[229px] placeholder-gray-600 dark:placeholder-[#0EFF7B] focus:ring-1 focus:ring-[#08994A] dark:focus:ring-[#0EFF7B] px-3 py-2 rounded-full border border-[#0EFF7B1A]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#08994A] dark:text-[#0EFF7B]" />
            </div>
            {/* Filter Button */}
            <button
              onClick={handleFilter}
              className="w-[32px] h-[32px] rounded-[20px] border border-[#0EFF7B1A] bg-[#0EFF7B1A] flex items-center justify-center hover:bg-[#0EFF7B33]"
            >
              <Filter size={16} className="text-[#08994A] dark:text-[#0EFF7B]" />
            </button>
            {/* Delete Button */}
            <button
              onClick={handleDelete}
              disabled={selectedEmployees.length === 0}
              className={`w-[32px] h-[32px] rounded-[20px] border border-[#0EFF7B1A] flex items-center justify-center ${
                selectedEmployees.length === 0 
                  ? 'bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] cursor-not-allowed' 
                  : 'bg-[#0EFF7B1A] hover:bg-[#0EFF7B33]'
              }`}
            >
              <Trash2 size={16} className={selectedEmployees.length === 0 ? 'text-[#0EFF7B]' : 'text-red-600 dark:text-red-500'} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-gray-100 dark:bg-black rounded-lg shadow overflow-hidden border border-gray-300 dark:border-gray-800">
          <table className="w-full">
            <thead className="bg-gray-200 dark:bg-[#091810]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#08994A] dark:text-white uppercase tracking-wider">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border border-[#0EFF7B] dark:border-gray-700 bg-gray-100 dark:bg-black appearance-none checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-gray-700 relative checked:after:content-['✓'] checked:after:absolute checked:after:text-white checked:after:text-xs checked:after:left-1/2 checked:after:top-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2" 
                    checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0} 
                    onChange={handleSelectAll} 
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#08994A] dark:text-[#0EFF7B] uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#08994A] dark:text-[#0EFF7B] uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#08994A] dark:text-[#0EFF7B] uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#08994A] dark:text-[#0EFF7B] uppercase tracking-wider">Net Pay</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#08994A] dark:text-[#0EFF7B] uppercase tracking-wider">Payment Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#08994A] dark:text-[#0EFF7B] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#08994A] dark:text-[#0EFF7B] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-100 dark:bg-black divide-y divide-gray-200 dark:divide-gray-800">
              {paginatedEmployees.length > 0 ? (
                paginatedEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B0D]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded border border-[#0EFF7B] dark:border-gray-700 bg-gray-100 dark:bg-black appearance-none checked:bg-[#08994A] dark:checked:bg-green-500 checked:border-[#0EFF7B] dark:checked:border-gray-700 relative checked:after:content-['✓'] checked:after:absolute checked:after:text-white checked:after:text-xs checked:after:left-1/2 checked:after:top-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2" 
                        checked={selectedEmployees.includes(emp.id)}
                        onChange={() => toggleSelect(emp.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black dark:text-white">{emp.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{emp.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{emp.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{emp.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{emp.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(emp.status)}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="w-[32px] h-[22px] rounded-[20px] border border-[#0EFF7B1A] bg-[#0EFF7B1A] flex items-center justify-center hover:bg-[#0EFF7B33]">
                        <Share2 size={16} className="text-[#08994A] dark:text-green-400" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                    No employees found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination - Outside table container */}
      <div className="flex items-center mt-4 bg-gray-100 dark:bg-black p-4 rounded gap-x-4 dark:border-[#1E1E1E]">
        <div className="text-sm text-black dark:text-white">
          Page {currentPage} of {totalPages} (
          {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, filteredEmployees.length)}{" "}
          from {filteredEmployees.length} Employees)
        </div>

        <div className="flex items-center gap-x-2">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`w-5 h-5 flex items-center justify-center rounded-full border ${
              currentPage === 1
                ? "border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                : "border-[#0EFF7B] dark:border-[#0EFF7B] bg-[#0EFF7B] dark:bg-[#0EFF7B] text-black dark:text-black hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A] hover:text-[#08994A] dark:hover:text-white"
            }`}
          >
            <ChevronLeft size={16} className={currentPage === 1 ? "text-gray-400" : "text-[#08994A] dark:text-black"} />
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
            className={`w-5 h-5 flex items-center justify-center rounded-full border ${
              currentPage === totalPages || totalPages === 0
                ? "border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                : "border-[#0EFF7B] dark:border-[#0EFF7B] bg-[#0EFF7B] dark:bg-[#0EFF7B] text-black dark:text-black hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A] hover:text-[#08994A] dark:hover:text-white"
            }`}
          >
            <ChevronRight size={16} className={currentPage === totalPages || totalPages === 0 ? "text-gray-400" : "text-[#08994A] dark:text-black"} />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="w-[504px] rounded-[20px] border border-[#0EFF7B] dark:border-[#1E1E1E] bg-gray-100 dark:bg-[#0D0D0D] text-black dark:text-white p-6 shadow-[0px_0px_4px_0px_rgba(255,255,255,0.12)] backdrop-blur-md relative">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 mb-4">
              <h3 className="text-lg font-semibold text-black dark:text-white">Delete Payment Records</h3>
              <button
                onClick={cancelDelete}
                className="w-6 h-6 rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow-[0px_0px_4px_0px_#0EFF7B1A] flex items-center justify-center hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A] hover:text-[#08994A] dark:hover:text-white"
              >
                <X size={16} className="text-[#08994A] dark:text-white" />
              </button>
            </div>

            {/* Message */}
            <p className="text-gray-600 dark:text-gray-300 text-center text-base mb-8">
              Are you sure you want to delete {selectedEmployees.length} selected payment record(s)? <br />
              This action cannot be undone.
            </p>

            {/* Buttons */}
            <div className="flex justify-center gap-6">
              <button
                onClick={cancelDelete}
                className="w-[104px] h-[33px] rounded-[20px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent px-3 py-2 flex items-center justify-center gap-2 text-black dark:text-white font-medium text-[14px] leading-[16px] shadow-[0px_2px_12px_0px_rgba(0,0,0,0.25)] opacity-100 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A] hover:text-[#08994A] dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="w-[104px] h-[33px] rounded-[20px] px-3 py-2 flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF4D4D] to-[#B30000] text-white font-medium text-[14px] leading-[16px] opacity-100 hover:scale-105 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="w-[504px] rounded-[20px] border border-[#0EFF7B] dark:border-[#1E1E1E] bg-gray-100 dark:bg-[#0D0D0D] text-black dark:text-white p-6 shadow-[0px_0px_4px_0px_rgba(255,255,255,0.12)] backdrop-blur-md relative">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 mb-4">
              <h3 className="text-lg font-semibold text-black dark:text-white">Filter Payroll</h3>
              <button
                onClick={closeFilterModal}
                className="w-6 h-6 rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow-[0px_0px_4px_0px_#0EFF7B1A] flex items-center justify-center hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A] hover:text-[#08994A] dark:hover:text-white"
              >
                <X size={16} className="text-[#08994A] dark:text-white" />
              </button>
            </div>

            {/* Filter Options */}
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-black dark:text-white text-sm mb-2">Status</p>
                <Listbox value={statusFilter} onChange={setStatusFilter}>
                  <div className="relative">
                    <Listbox.Button className="flex items-center justify-between w-full h-[42px] border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[20px] px-[12px] py-[8px] text-sm text-[#08994A] dark:text-white bg-[#F5F6F5] dark:bg-black">
                      <span>{statusFilter || 'All Status'}</span>
                      <svg
                        className="h-4 w-4 text-[#08994A] dark:text-[#0EFF7B]"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </Listbox.Button>
                    <Listbox.Options className="absolute z-10 mt-1 w-full max-h-60 overflow-auto border border-[#0EFF7B] dark:border-[#3C3C3C] bg-gray-100 dark:bg-black rounded-md shadow-lg">
                      {statusOptions.map((status) => (
                        <Listbox.Option
                          key={status}
                          value={status === 'All Status' ? '' : status}
                          className={({ active }) => 
                            `px-[12px] py-[8px] text-sm text-[#08994A] dark:text-white cursor-pointer ${
                              active ? 'bg-[#0EFF7B1A] dark:bg-[#0EFF7B33]' : ''
                            }`
                          }
                        >
                          {status}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
              </div>

              <div>
                <p className="text-black dark:text-white text-sm mb-2">Role</p>
                <Listbox value={role} onChange={setRole}>
                  <div className="relative">
                    <Listbox.Button className="flex items-center justify-between w-full h-[42px] border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[20px] px-[12px] py-[8px] text-sm text-[#08994A] dark:text-white bg-[#F5F6F5] dark:bg-black">
                      <span>{role || 'All Roles'}</span>
                      <svg
                        className="h-4 w-4 text-[#08994A] dark:text-[#0EFF7B]"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </Listbox.Button>
                    <Listbox.Options className="absolute z-10 mt-1 w-full max-h-[210px] overflow-auto border border-[#0EFF7B] dark:border-[#3C3C3C] bg-gray-100 dark:bg-black rounded-md shadow-lg">
                      {roles.map((rl) => (
                        <Listbox.Option
                          key={rl}
                          value={rl === 'All Roles' ? '' : rl}
                          className={({ active }) => 
                            `px-[12px] py-[8px] text-sm text-[#08994A] dark:text-white cursor-pointer ${
                              active ? 'bg-[#0EFF7B1A] dark:bg-[#0EFF7B33]' : ''
                            }`
                          }
                        >
                          {rl}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-6">
              <button
                onClick={clearFilters}
                className="w-[104px] h-[33px] rounded-[20px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent px-3 py-2 flex items-center justify-center gap-2 text-black dark:text-white font-medium text-[14px] leading-[16px] shadow-[0px_2px_12px_0px_rgba(0,0,0,0.25)] opacity-100 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A] hover:text-[#08994A] dark:hover:text-white"
              >
                Clear
              </button>
              <button
                onClick={confirmFilter}
                className="w-[104px] h-[33px] rounded-[20px] px-3 py-2 flex items-center justify-center gap-2 bg-gradient-to-r from-[#08994A] to-[#0EFF7B] text-white font-medium text-[14px] leading-[16px] opacity-100 hover:scale-105 transition"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollManagement;