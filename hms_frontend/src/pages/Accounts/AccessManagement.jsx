import React, { useState } from "react";
import { Search, Edit, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Listbox } from "@headlessui/react";

const users = [
  { sno: 1, name: "Prakash.M", email: "PrakashTJ78@gmail.com", doj: "19-09-2025", role: "Doctor", phone: "+91-8976654321" },
  { sno: 2, name: "Sravan.L", email: "Sravan6778@gmail.com", doj: "21-09-2025", role: "Doctor", phone: "+91-9876543211" },
  { sno: 3, name: "Praveen.K", email: "Praveen8978@gmail.com", doj: "24-09-2025", role: "Doctor", phone: "+91-8785634452" },
  { sno: 4, name: "Keerthana.M", email: "Keerthanayu@gmail.com", doj: "10-09-2025", role: "Doctor", phone: "+91-9870654313" },
  { sno: 5, name: "Rajkumar.R", email: "Rajkumar56778@gmail.com", doj: "09-09-2025", role: "Doctor", phone: "+91-9123456789" },
];

const AccessManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeRole, setActiveRole] = useState("Doctor");
  const [selectedEntries, setSelectedEntries] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editedUser, setEditedUser] = useState({});
  const entriesOptions = [5, 10, 15, 20];

  const filteredUsers = users.filter(
    (u) =>
      (activeRole ? u.role === activeRole : true) &&
      (u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredUsers.length / selectedEntries);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * selectedEntries,
    currentPage * selectedEntries
  );

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditedUser({ ...user });
    setShowEditPopup(true);
  };

  const handleDelete = (sno) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      // Simulate deletion (in a real app, this would be an API call)
      const updatedUsers = users.filter((u) => u.sno !== sno);
      // Update the users array (in a real app, fetch updated data)
      console.log("User deleted:", sno);
    }
  };

  const handleSaveEdit = () => {
    if (selectedUser) {
      const updatedUsers = users.map((u) =>
        u.sno === selectedUser.sno ? { ...u, ...editedUser } : u
      );
      // Update the users array (in a real app, send to API)
      console.log("User updated:", editedUser);
      setShowEditPopup(false);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div
      className="mb-4 bg-gray-100 dark:bg-black text-black dark:text-white dark:border-[#1E1E1E] rounded-xl p-6 w-full max-w-[1400px] mx-auto flex flex-col bg-gray-100 dark:bg-transparent overflow-hidden relative"
    >
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
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          pointerEvents: "none",
          zIndex: 0,
        }}
      ></div>

      {/* Header Section */}
      <div className="mb-6 relative z-10">
        <h1 className="text-xl font-medium text-white">Access Management</h1>
        <p className="text-sm text-gray-400">This is the information only edited by the User</p>
      </div>

      {/* Top Controls */}
      <div className="flex justify-between items-center mb-5 flex-wrap gap-3 relative z-10">
        <button
          className="bg-[linear-gradient(92.18deg,#025126_3.26%,#0D7F41_50.54%,#025126_97.83%)]
           text-white border-b-[2px] border-[#0EFF7B] px-4 py-2 rounded-md font-medium hover:bg-[#0EFF99] transition"
        >
          Add New User
        </button>

        <div className="relative">
          <Search className="absolute left-3 top-3.5 text-[#08994A] dark:text-[#0EFF7B] w-4 h-4" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] border border-[#0EFF7B1A] text-[#08994A] dark:text-white rounded-full focus:outline-none placeholder-[#08994A] dark:placeholder-[#0EFF7B99]"
          />
        </div>
      </div>

      {/* Role Tabs */}
      <div className="flex gap-[19.3px] mb-5 overflow-x-auto pb-2 relative z-10">
        {["Admin", "Doctor", "Nurse", "Receptionist", "Pharmacists", "Lab technicians"].map((role) => (
          <button
            key={role}
            onClick={() => setActiveRole(role)}
            className={`w-[155.67px] h-[33.78px] rounded-[8px] px-[11.58px] text-sm font-medium transition duration-200
              ${activeRole === role ? "bg-[#0EFF7B1A] text-[#0EFF7B]" : "text-[#0EFF7B99] dark:text-[#0EFF7B] hover:text-[#0EFF7B]"}`}
            style={{
              borderBottom: "0.97px solid",
              borderImage:
                "linear-gradient(90deg, rgba(14,255,123,0.12) 0%, #0EFF7B 50.09%, rgba(14,255,123,0.12) 100.19%) 1",
            }}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Entries Selector */}
      <div className="flex items-center mb-5 gap-2 relative z-10">
        <span className="text-white font-medium">Show</span>
        <Listbox value={selectedEntries} onChange={setSelectedEntries}>
          <div className="relative">
            <Listbox.Button className="ml-2 p-2 bg-[#F5F6F5] dark:bg-black text-[#08994A] dark:text-white border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-md focus:outline-none">
              {selectedEntries}
            </Listbox.Button>
            <Listbox.Options className="absolute mt-1 w-16 bg-gray-100 dark:bg-black border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-md shadow-lg">
              {entriesOptions.map((option) => (
                <Listbox.Option
                  key={option}
                  value={option}
                  className="p-2 text-[#08994A] dark:text-white hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B33] cursor-pointer"
                >
                  {option}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
        <span className="ml-2 text-white font-medium">Entries</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-[#0EFF7B1A] relative z-10">
        <table className="w-full border-collapse">
          <thead className="bg-[#F5F6F5] dark:bg-[#082216] text-[#08994A] dark:text-white text-sm">
            <tr>
              <th className="px-4 py-3 text-left font-medium">S.NO</th>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Email ID</th>
              <th className="px-4 py-3 text-left font-medium">DOJ</th>
              <th className="px-4 py-3 text-left font-medium">Role</th>
              <th className="px-4 py-3 text-left font-medium">Phone No</th>
              <th className="px-4 py-3 text-center font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr
                key={user.sno}
                className="bg-gray-100 dark:bg-transparent border-gray-300 dark:border-gray-800 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B0D] transition"
              >
                <td className="px-4 py-3 text-sm text-[#0EFF7B]">{user.sno}.</td>
                <td className="px-4 py-3 text-sm">{user.name}</td>
                <td className="px-4 py-3 text-sm text-[#0EFF7B]">{user.email}</td>
                <td className="px-4 py-3 text-sm">{user.doj}</td>
                <td className="px-4 py-3 text-sm text-[#0EFF7B]">{user.role}</td>
                <td className="px-4 py-3 text-sm text-[#0EFF7B] whitespace-nowrap">{user.phone}</td>
                <td className="px-4 py-3 text-center flex justify-center gap-3">
                  <button
                    onClick={() => handleEdit(user)}
                    className="hover:scale-110 transition text-[#08994A] dark:text-green-400"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(user.sno)}
                    className="hover:scale-110 transition text-[#08994A] dark:text-green-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center mt-4 bg-gray-100 dark:bg-[#000000] rounded gap-x-4 relative z-10">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Page{" "}
          <span className="text-[#08994A] dark:text-green-500 font-semibold">
            {currentPage}
          </span>{" "}
          of {totalPages} ({(currentPage - 1) * selectedEntries + 1} to{" "}
          {Math.min(currentPage * selectedEntries, filteredUsers.length)} from{" "}
          {filteredUsers.length} entries)
        </div>
        <div className="flex items-center gap-x-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`w-5 h-5 flex items-center justify-center rounded-full border ${
              currentPage === 1
                ? "bg-gray-200 dark:bg-[#0EFF7B1A] border-gray-300 dark:border-[#0EFF7B1A] text-gray-600 dark:text-white opacity-50"
                : "bg-[#08994A] dark:bg-[#0EFF7B] border-[#08994A] dark:border-[#0EFF7B] text-white dark:text-black"
            }`}
          >
            <ChevronLeft size={12} />
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`w-5 h-5 flex items-center justify-center rounded-full border ${
              currentPage === totalPages
                ? "bg-gray-200 dark:bg-[#0EFF7B1A] border-gray-300 dark:border-[#0EFF7B1A] text-gray-600 dark:text-white opacity-50"
                : "bg-[#08994A] dark:bg-[#0EFF7B] border-[#08994A] dark:border-[#0EFF7B] text-white dark:text-black"
            }`}
          >
            <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* Edit Popup */}
      {showEditPopup && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div
            className="rounded-[20px] p-[1px] backdrop-blur-md shadow-[0px_0px_4px_0px_#FFFFFF1F]
      bg-gradient-to-r from-green-400/70 via-gray-300/30 to-green-400/70
      dark:bg-[linear-gradient(132.3deg,rgba(14,255,123,0.7)_0%,rgba(30,30,30,0.7)_49.68%,rgba(14,255,123,0.7)_99.36%)]"
          >
            <div
              className="w-[505px] h-auto rounded-[19px] bg-gray-100 dark:bg-[#000000] text-black dark:text-white p-6 relative"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              <div className="flex justify-between items-center pb-3 mb-4">
                <h2 className="text-black dark:text-white font-medium text-[16px] leading-[19px]">
                  Edit User
                </h2>
                <button
                  onClick={() => setShowEditPopup(false)}
                  className="w-6 h-6 rounded-full border border-gray-300 dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow flex items-center justify-center"
                >
                  <X size={16} className="text-black dark:text-white" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-black dark:text-white">Name</label>
                  <input
                    value={editedUser.name || ""}
                    onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                    placeholder="Enter name"
                    className="w-[228px] h-[32px] mt-1 px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A]
              bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] placeholder-gray-400 dark:placeholder-gray-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-black dark:text-white">Email</label>
                  <input
                    value={editedUser.email || ""}
                    onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                    placeholder="Enter email"
                    className="w-[228px] h-[32px] mt-1 px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A]
              bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] placeholder-gray-400 dark:placeholder-gray-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-black dark:text-white">DOJ</label>
                  <input
                    value={editedUser.doj || ""}
                    onChange={(e) => setEditedUser({ ...editedUser, doj: e.target.value })}
                    placeholder="Enter DOJ"
                    className="w-[228px] h-[32px] mt-1 px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A]
              bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] placeholder-gray-400 dark:placeholder-gray-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-black dark:text-white">Role</label>
                  <input
                    value={editedUser.role || ""}
                    onChange={(e) => setEditedUser({ ...editedUser, role: e.target.value })}
                    placeholder="Enter role"
                    className="w-[228px] h-[32px] mt-1 px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A]
              bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] placeholder-gray-400 dark:placeholder-gray-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-black dark:text-white">Phone</label>
                  <input
                    value={editedUser.phone || ""}
                    onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                    placeholder="Enter phone"
                    className="w-[228px] h-[32px] mt-1 px-3 rounded-[8px] border border-gray-300 dark:border-[#3A3A3A]
              bg-gray-100 dark:bg-transparent text-black dark:text-[#0EFF7B] placeholder-gray-400 dark:placeholder-gray-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={() => setShowEditPopup(false)}
                  className="w-[144px] h-[32px] rounded-[8px] border border-gray-300 dark:border-[#3A3A3A]
            bg-gray-100 dark:bg-transparent text-black dark:text-white font-medium text-[14px] leading-[16px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="w-[144px] h-[32px] rounded-[8px] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126]
            text-white font-medium text-[14px] leading-[16px] hover:scale-105 transition"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessManagement;