// import { useState, React } from "react";
// import { useNavigate } from "react-router-dom";
// import BP from "../../assets/BP.png";
// import HR from "../../assets/HR.png";
// import GL from "../../assets/GL.png";
// import CL from "../../assets/CL.png";
// import {
//   ClipboardList,
//   FileText,
//   Receipt,
//   TestTube2,
//   ChevronLeft,
//   ChevronRight,
//   ArrowLeft,
// } from "lucide-react";

// export default function ViewPatientProfile() {
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState("Diagnosis");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [currentPrescriptionPage, setCurrentPrescriptionPage] = useState(1);

//   const itemsPerPage = 10;

//   // Diagnosis Data
//   const diagnoses = [
//     {
//       reportType: "CT Scan",
//       date: "10 Apr 2025",
//       description: "Lorem ipsum, dolor sit amet consectetur adipisicing elit.",
//       status: "Completed",
//     },
//     {
//       reportType: "Blood Test",
//       date: "11 Jul 2025",
//       description: "Lorem ipsum, dolor sit amet consectetur adipisicing elit.",
//       status: "Pending",
//     },
//     {
//       reportType: "Blood Analysis",
//       date: "11 Jul 2025",
//       description: "Lorem ipsum, dolor sit amet consectetur adipisicing elit.",
//       status: "Cancelled",
//     },
//     {
//       reportType: "Vascular Sonography",
//       date: "10 Jul 2025",
//       description: "Lorem ipsum, dolor sit amet consectetur adipisicing elit.",
//       status: "Completed",
//     },
//   ];

//   const totalDiagnosisPages = Math.ceil(diagnoses.length / itemsPerPage);
//   const currentDiagnoses = diagnoses.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   // Prescription Data
//   const prescriptions = [
//     {
//       date: "12 Apr 2025",
//       prescription: "Paracetamol 500mg",
//       dosage: "1 Tablet",
//       timing: "Morning & Night",
//       status: "Completed",
//     },
//     {
//       date: "13 Apr 2025",
//       prescription: "Amoxicillin 250mg",
//       dosage: "2 Capsules",
//       timing: "After Lunch",
//       status: "Pending",
//     },
//     {
//       date: "14 Apr 2025",
//       prescription: "Vitamin D3",
//       dosage: "1 Capsule",
//       timing: "Morning",
//       status: "Cancelled",
//     },
//   ];

//   const testReports = [
//     {
//       dateTime: "2025-04-10 09:45 AM",
//       month: "April",
//       testType: "Blood Sugar Test",
//       department: "Pathology",
//       status: "Completed",
//     },
//     {
//       dateTime: "2025-05-15 11:20 AM",
//       month: "May",
//       testType: "X-Ray",
//       department: "Radiology",
//       status: "Pending",
//     },
//     {
//       dateTime: "2025-06-20 10:15 AM",
//       month: "June",
//       testType: "MRI Scan",
//       department: "Radiology",
//       status: "Cancelled",
//     },
//   ];

//   const [selectedMonth, setSelectedMonth] = useState("All");
//   const [selectedDepartment, setSelectedDepartment] = useState("All");
//   const [selectedStatus, setSelectedStatus] = useState("All");

//   const filteredTests = testReports.filter(
//     (t) =>
//       (selectedMonth === "All" || t.month === selectedMonth) &&
//       (selectedDepartment === "All" || t.department === selectedDepartment) &&
//       (selectedStatus === "All" || t.status === selectedStatus)
//   );
//   const [currentTestPage, setCurrentTestPage] = useState(1);
//   const totalTestPages = Math.ceil(filteredTests.length / itemsPerPage);
//   const currentTests = filteredTests.slice(
//     (currentTestPage - 1) * itemsPerPage,
//     currentTestPage * itemsPerPage
//   );

//   const totalPrescriptionPages = Math.ceil(prescriptions.length / itemsPerPage);
//   const currentPrescriptions = prescriptions.slice(
//     (currentPrescriptionPage - 1) * itemsPerPage,
//     currentPrescriptionPage * itemsPerPage
//   );

//   return (
//     <div
//       className="mt-[80px]  mb-4 bg-gray-100 dark:bg-black text-black dark:text-white dark:border-[#1E1E1E] rounded-xl p-4 w-full max-w-[1400px] mx-auto flex flex-col
//      bg-gray-100 dark:bg-transparent overflow-hidden relative"
//     >
//       <div
//         className="absolute inset-0 rounded-[8px] pointer-events-none dark:block hidden"
//         style={{
//           background:
//             "linear-gradient(180deg, rgba(3,56,27,0.25) 16%, rgba(15,15,15,0.25) 48.97%)",
//           zIndex: 0,
//         }}
//       ></div>
//       {/* Gradient Border */}
//       <div
//         style={{
//           position: "absolute",
//           inset: 0,
//           borderRadius: "10px",
//           padding: "2px",
//           background:
//             "linear-gradient(to bottom right, rgba(14,255,123,0.7) 0%, rgba(30,30,30,0.7) 50%, rgba(14,255,123,0.7) 100%)",
//           WebkitMask:
//             "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
//           WebkitMaskComposite: "xor",
//           maskComposite: "exclude",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       ></div>
//       {/* Back Button */}
//       <button
//   onClick={() => {
//     if (window.history.state && window.history.state.idx > 0) {
//       navigate(-1);
//     } else {
//       navigate("/patients");
//     }
//   }}
//   className="flex mt-4 items-center gap-2 w-[92px] h-[40px] rounded-[8px] px-3 border-b-[2px] border-[#0EFF7B] shadow-[0_2px_12px_0px_#00000040] text-white font-medium text-[14px] leading-[16px] transition-transform hover:scale-105 mb-6"
//   style={{
//     background: "linear-gradient(92.18deg, #025126 3.26%, #0D7F41 50.54%, #025126 97.83%)",
//   }}
// >
//   <ArrowLeft size={18} />
//   Back
// </button>

//       {/* Profile Card */}
// <div
//   className="relative mb-8 w-[1057px] bg-gray-100  dark:bg-transparent border border-[#0EFF7B]  dark:border-[#0EFF7B1A] mx-auto  flex flex-col md:flex-row items-center md:items-start text-black dark:text-white  rounded-[20px] p-6 md:p-[45px] dark:shadow-[0_0_4px_0_#FFFFFF1F] overflow-hidden"

// ><div
//         className="absolute inset-0 rounded-[8px] pointer-events-none dark:block hidden"
//         style={{
//           background:
//             "linear-gradient(180deg, rgba(3, 56, 27, 0.25) 0%, rgba(15, 15, 15, 0.25) 48.97%)",
//           zIndex: 0,
//         }}
//       ></div>
//         {" "}
//         {/* Avatar Section */}{" "}
//         <div className="w-[146px] h-[187px] flex-shrink-0 flex flex-col gap-[4px] items-center pr-2 md:mr-[65px] ml-3">
//           {" "}
//           <div className="rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center mb-3">
//             {" "}
//             <svg
//               className="w-[94px] h-[94px] text-gray-600 dark:text-gray-400"
//               fill="currentColor"
//               viewBox="0 0 24 24"
//             >
//               {" "}
//               <circle cx="12" cy="8" r="4" />{" "}
//               <path d="M12 14c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4z" />{" "}
//             </svg>{" "}
//           </div>{" "}
//           <span className="text-[#08994A] dark:text-[##0EFF7B] text-[18px] font-medium">
//             {" "}
//             Mrs. Watson{" "}
//           </span>{" "}
//           <span className="text-[14px] text-gray-600 dark:text-[#A0A0A0]">
//             {" "}
//             ID: SAH257384{" "}
//           </span>{" "}
//           <span className="text-[14px] text-gray-600 dark:text-[#A0A0A0]">
//             {" "}
//             watson22@gmail.com{" "}
//           </span>{" "}
//           <button className="mt-1 text-[#08994A] dark:text-blue-400 underline text-xs hover:text-green-800 dark:hover:text-blue-300">
//             {" "}
//             Edit{" "}
//           </button>{" "}
//         </div>{" "}
//         <div className="w-[1px] h-[187px] bg-gray-300 dark:bg-[#A0A0A0] mr-6"></div>{" "}
//         {/* Info Section */}{" "}
//         <div className="w-[761px] h-[200px] md:ml-12 ml-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px] mt-6 md:mt-0">
//           {" "}
//           <div>
//             {" "}
//             <p className="text-[16px] text-[#0EFF7B] font-semibold">
//               Gender
//             </p>{" "}
//             <p className="text-[14px] text-black dark:text-white">Female</p>{" "}
//           </div>{" "}
//           <div>
//             {" "}
//             <p className="text-[16px] text-[#0EFF7B] font-semibold">Age</p>{" "}
//             <p className="text-[14px] text-black dark:text-white">28</p>{" "}
//           </div>{" "}
//           <div>
//             {" "}
//             <p className="text-[16px] text-[#0EFF7B] font-semibold">
//               {" "}
//               Blood Group{" "}
//             </p>{" "}
//             <p className="text-[14px] text-black dark:text-white">A+ve</p>{" "}
//           </div>{" "}
//           <div>
//             {" "}
//             <p className="text-[16px] text-[#0EFF7B] font-semibold">
//               {" "}
//               Phone number{" "}
//             </p>{" "}
//             <p className="text-[14px] text-black dark:text-white">
//               {" "}
//               +91 62742 xxxxx{" "}
//             </p>{" "}
//           </div>{" "}
//           <div>
//             {" "}
//             <p className="text-[16px] text-[#0EFF7B] font-semibold">
//               Status
//             </p>{" "}
//             <p className="text-[14px] text-black dark:text-white">Normal</p>{" "}
//           </div>{" "}
//           <div>
//             {" "}
//             <p className="text-[16px] text-[#0EFF7B] font-semibold">
//               {" "}
//               Department{" "}
//             </p>{" "}
//             <p className="text-[14px] text-black dark:text-white">
//               Cardiology
//             </p>{" "}
//           </div>{" "}
//           <div>
//             {" "}
//             <p className="text-[16px] text-[#0EFF7B] font-semibold">
//               {" "}
//               Admission date{" "}
//             </p>{" "}
//             <p className="text-[14px] text-black dark:text-white">
//               {" "}
//               20 July 2025{" "}
//             </p>{" "}
//           </div>{" "}
//           <div>
//             {" "}
//             <p className="text-[16px] text-[#0EFF7B] font-semibold">
//               {" "}
//               Bed Number{" "}
//             </p>{" "}
//             <p className="text-[14px] text-black dark:text-white">
//               RM 325
//             </p>{" "}
//           </div>{" "}
//           <div>
//             {" "}
//             <p className="text-[16px] text-[#0EFF7B] font-semibold">
//               {" "}
//               Visiting Doctor{" "}
//             </p>{" "}
//             <p className="text-[14px] text-black dark:text-white">
//               Dr. Sravan
//             </p>{" "}
//           </div>{" "}
//           <div>
//             {" "}
//             <p className="text-[16px] text-[#0EFF7B] font-semibold">
//               {" "}
//               Consultation type{" "}
//             </p>{" "}
//             <p className="text-[14px] text-black dark:text-white">
//               In-patient
//             </p>{" "}
//           </div>{" "}
//         </div>{" "}
//       </div>
//       {/* Vitals Section */}{" "}
//       <div className="mb-8">
//         {" "}
//         <h1 className="text-black dark:text-white text-xl font-semibold mb-4">
//           {" "}
//           Patient Current Vitals{" "}
//         </h1>{" "}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           {" "}
//           {/* Blood Pressure */}{" "}
//           <div
//             className="w-[225px] h-[88px] bg-gray-100 dark:bg-[#0D0D0D] border border-[#0EFF7B] dark:border-[#0EFF7B66] rounded-[8px] flex items-center justify-between px-4 gap-3"
//             style={{
//               backgroundColor: "rgba(14, 255, 123, 0.02)",
//               fontFamily: "Helvetica, sans-serif",
//             }}
//           >
//             {" "}
//             <img
//               src={BP}
//               alt="Blood Pressure Icon"
//               className="w-[45px] h-[45px] object-contain"
//             />{" "}
//             <div className="flex flex-col justify-center items-end space-y-1.5">
//               {" "}
//               <span className="text-[18px] text-white font-medium">
//                 {" "}
//                 Blood Pressure{" "}
//               </span>{" "}
//               <span className="text-[22px] text-[#0EFF7B] font-bold leading-none relative">
//                 {" "}
//                 120/89{" "}
//                 <span className="text-[18px] text-white font-normal ml-1 relative -top-1">
//                   {" "}
//                   mmHg{" "}
//                 </span>{" "}
//               </span>{" "}
//             </div>{" "}
//           </div>{" "}
//           {/* Heart Rate */}{" "}
//           <div
//             className="w-[225px] h-[88px] bg-gray-100 dark:bg-[#0D0D0D] border border-[#0EFF7B] dark:border-[#0EFF7B66] rounded-[8px] flex items-center justify-between px-4 gap-3"
//             style={{
//               backgroundColor: "rgba(14, 255, 123, 0.02)",
//               fontFamily: "Helvetica, sans-serif",
//             }}
//           >
//             {" "}
//             <img
//               src={HR}
//               alt="Heart Rate Icon"
//               className="w-[45px] h-[45px] object-contain"
//             />{" "}
//             <div className="flex flex-col justify-center items-end space-y-1.5">
//               {" "}
//               <span className="text-[18px] text-white font-medium">
//                 {" "}
//                 Heart Rate{" "}
//               </span>{" "}
//               <span className="text-[28px] text-[#0EFF7B] font-bold leading-none relative">
//                 {" "}
//                 120{" "}
//                 <span className="text-[18px] text-white font-normal ml-1 relative -top-1">
//                   {" "}
//                   BPM{" "}
//                 </span>{" "}
//               </span>{" "}
//             </div>{" "}
//           </div>{" "}
//           {/* Glucose */}{" "}
//           <div
//             className="w-[225px] h-[88px] bg-gray-100 dark:bg-[#0D0D0D] border border-[#0EFF7B] dark:border-[#0EFF7B66] rounded-[8px] flex items-center justify-between px-4 gap-3"
//             style={{
//               backgroundColor: "rgba(14, 255, 123, 0.02)",
//               fontFamily: "Helvetica, sans-serif",
//             }}
//           >
//             {" "}
//             <img
//               src={GL}
//               alt="Glucose Icon"
//               className="w-[45px] h-[45px] object-contain"
//             />{" "}
//             <div className="flex flex-col justify-center items-end space-y-1.5">
//               {" "}
//               <span className="text-[18px] text-white font-medium">
//                 {" "}
//                 Glucose{" "}
//               </span>{" "}
//               <span className="text-[28px] text-[#0EFF7B] font-bold leading-none relative">
//                 {" "}
//                 97{" "}
//                 <span className="text-[18px] text-white font-normal ml-1 relative -top-1">
//                   {" "}
//                   mg/dl{" "}
//                 </span>{" "}
//               </span>{" "}
//             </div>{" "}
//           </div>{" "}
//           {/* Cholesterol */}{" "}
//           <div
//             className="w-[225px] h-[88px] bg-gray-100 dark:bg-[#0D0D0D] border border-[#0EFF7B] dark:border-[#0EFF7B66] rounded-[8px] flex items-center justify-between px-4 gap-3"
//             style={{
//               backgroundColor: "rgba(14, 255, 123, 0.02)",
//               fontFamily: "Helvetica, sans-serif",
//             }}
//           >
//             {" "}
//             <img
//               src={CL}
//               alt="Cholesterol Icon"
//               className="w-[45px] h-[45px] object-contain"
//             />{" "}
//             <div className="flex flex-col justify-center items-end space-y-1.5">
//               {" "}
//               <span className="text-[18px] text-white font-medium">
//                 {" "}
//                 Cholesterol{" "}
//               </span>{" "}
//               <span className="text-[28px] text-[#0EFF7B] font-bold leading-none relative">
//                 {" "}
//                 85{" "}
//                 <span className="text-[18px] text-white font-normal ml-1 relative -top-1">
//                   {" "}
//                   mg/dl{" "}
//                 </span>{" "}
//               </span>{" "}
//             </div>{" "}
//           </div>{" "}
//         </div>{" "}
//       </div>
//       {/* Tabs Section */}
//       <div
//       className="mt-[10px]  mb-4 bg-gray-100 dark:bg-black text-black dark:text-white border border-[#0EFF7B]  dark:border-[#0EFF7B1A] rounded-xl p-4 w-full max-w-[1400px] mx-auto flex flex-col
//      bg-gray-100 dark:bg-transparent overflow-hidden relative"
//     >
//       <div
//         className="absolute inset-0 rounded-[8px] pointer-events-none dark:block hidden"
//         style={{
//           background:
//             "linear-gradient(180deg, rgba(3,56,27,0.25) 16%, rgba(15,15,15,0.25) 48.97%)",
//           zIndex: 0,
//         }}
//       ></div>
//         {/* Tabs */}
//         <div className="w-full overflow-x-auto h-[50px] flex items-center justify-center mb-8 px-2 relative z-10">
//           <div
//             className="flex justify-between gap-[91px] min-w-[640px] mx-auto"
//             style={{ maxWidth: "1440px" }}
//           >
//             {[
//               { name: "Diagnosis", icon: ClipboardList },
//               { name: "Prescription", icon: FileText },
//               { name: "Invoice", icon: Receipt },
//               { name: "Test Reports", icon: TestTube2 },
//             ].map(({ name, icon: Icon }) => (
//               <button
//   key={name}
//   onClick={() => setActiveTab(name)}
//   className={`relative min-w-[180px] h-[40px] flex items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-all
//     ${activeTab === name ? "bg-[#0EFF7B14] text-[#0EFF7B]" : "text-[#0EFF7B] hover:text-green-600 dark:text-[#0EFF7B]"}
//   `}
//   style={{
//     borderBottom: "1px solid",
//     borderImageSlice: 1,
//     borderImageSource: "linear-gradient(90.03deg, #000000 0%, #0EFF7B 49.98%, #000000 99.96%)",
//   }}
// >
//   <Icon
//     size={18}
//     className={`${
//       activeTab === name ? "text-[#0EFF7B]" : "text-[#0EFF7B] dark:text-[#0EFF7B]"
//     }`}
//   />
//   {name}
// </button>

//             ))}
//           </div>
//         </div>

//         {/* Diagnosis Tab */}
//         {activeTab === "Diagnosis" && (
//           <div className="overflow-x-auto rounded-xl p-4 mb-4 bg-transparent">
//             <p className="text-gray-600 dark:text-[#A0A0A0] text-[16px] mb-4">
//               Patient’s diagnosis information.
//             </p>
//             <table className="min-w-full border-separate border-spacing-x-1 bg-transparent">
//               <thead>
//                 <tr className="text-left text-[16px] text-[#08994A] dark:text-[#0EFF7B] border-b border-gray-300 dark:border-gray-700">
//                   <th className="py-3">Report Type</th>
//                   <th className="py-3">Date</th>
//                   <th className="py-3">Description</th>
//                   <th className="py-3">Status</th>
//                 </tr>
//               </thead>
//               <tbody className="text-[16px] text-black dark:text-white">
//                 {currentDiagnoses.map((diagnosis, index) => (
//                   <tr
//                     key={index}
//                     className="border-b border-gray-200 dark:border-gray-700"
//                   >
//                     <td className="py-4">{diagnosis.reportType}</td>
//                     <td className="py-4">{diagnosis.date}</td>
//                     <td className="py-4">{diagnosis.description}</td>
//                     <td className="py-4">
//                       <span
//                         className={`inline-block px-3 py-1 text-xs font-semibold rounded-full
//                         ${
//                           diagnosis.status === "Completed"
//                             ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
//                             : diagnosis.status === "Pending"
//                             ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
//                             : diagnosis.status === "Cancelled"
//                             ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
//                             : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
//                         }`}
//                       >
//                         {diagnosis.status}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             {/* Pagination */}
//             <div className="flex items-center mt-4 gap-x-4">
//               <div className="text-sm text-black dark:text-white">
//                 Page {currentPage} of {totalDiagnosisPages}
//               </div>
//               <div className="flex items-center gap-x-2">
//                 <button
//                   onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
//                   disabled={currentPage === 1}
//                   className="p-1 rounded-full border border-[#0EFF7B]"
//                 >
//                   <ChevronLeft size={12} />
//                 </button>
//                 <button
//                   onClick={() =>
//                     setCurrentPage(
//                       Math.min(totalDiagnosisPages, currentPage + 1)
//                     )
//                   }
//                   disabled={currentPage === totalDiagnosisPages}
//                   className="p-1 rounded-full border border-[#0EFF7B]"
//                 >
//                   <ChevronRight size={12} />
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Prescription Tab */}
//         {activeTab === "Prescription" && (
//           <div className="overflow-x-auto rounded-xl p-4 mb-4 bg-transparent">
//             <p className="text-gray-600 dark:text-[#A0A0A0] text-[16px] mb-4">
//               Patient’s prescription details.
//             </p>
//             <table className="min-w-full border-separate border-spacing-x-1 bg-transparent">
//               <thead>
//                 <tr className="text-left text-[16px] text-[#08994A] dark:text-[#0EFF7B] border-b border-gray-300 dark:border-gray-700">
//                   <th className="py-3">Date</th>
//                   <th className="py-3">Prescription</th>
//                   <th className="py-3">Dosage</th>
//                   <th className="py-3">Timing</th>
//                   <th className="py-3">Status</th>
//                 </tr>
//               </thead>

//               <tbody className="text-[16px] text-black dark:text-white">
//                 {currentPrescriptions.map((item, index) => (
//                   <tr
//                     key={index}
//                     className="border-b border-gray-200 dark:border-gray-700"
//                   >
//                     <td className="py-4">{item.date}</td>
//                     <td className="py-4">{item.prescription}</td>
//                     <td className="py-4">{item.dosage}</td>
//                     <td className="py-4">{item.timing}</td>
//                     <td className="py-4">
//                       <span
//                         className={`inline-block px-3 py-1 text-xs font-semibold rounded-full
//                         ${
//                           item.status === "Completed"
//                             ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
//                             : item.status === "Pending"
//                             ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
//                             : item.status === "Cancelled"
//                             ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
//                             : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
//                         }`}
//                       >
//                         {item.status}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             {/* Pagination */}
//             <div className="flex items-center mt-4 gap-x-4">
//               <div className="text-sm text-black dark:text-white">
//                 Page {currentPrescriptionPage} of {totalPrescriptionPages}
//               </div>
//               <div className="flex items-center gap-x-2">
//                 <button
//                   onClick={() =>
//                     setCurrentPrescriptionPage(
//                       Math.max(1, currentPrescriptionPage - 1)
//                     )
//                   }
//                   disabled={currentPrescriptionPage === 1}
//                   className="p-1 rounded-full border border-[#0EFF7B]"
//                 >
//                   <ChevronLeft size={12} />
//                 </button>
//                 <button
//                   onClick={() =>
//                     setCurrentPrescriptionPage(
//                       Math.min(
//                         totalPrescriptionPages,
//                         currentPrescriptionPage + 1
//                       )
//                     )
//                   }
//                   disabled={currentPrescriptionPage === totalPrescriptionPages}
//                   className="p-1 rounded-full border border-[#0EFF7B]"
//                 >
//                   <ChevronRight size={12} />
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Placeholder Tabs */}
//         {activeTab === "Invoice" && (
//           <div className="overflow-x-auto rounded-xl p-4 mb-4 bg-transparent">
//             {/* Top Section: Patient & Doctor Info */}
//             <div className="mt-4 text-black dark:text-white">
//               <p>Invoice Number</p>
//               <p>#123456</p>
//             </div>
//             <div className="flex flex-col lg:flex-row justify-between mb-6 gap-6">
//               {/* Left Column: Patient Info */}
//               <div className="flex-1 border-l-2 border-[#0EFF7B] pl-4">
//                 <p className="text-[#0EFF7B] font-semibold mb-2">
//                   PATIENT INFORMATION
//                 </p>
//                 <p className="text-black dark:text-white">Harry Wilson</p>
//                 <p className="text-black dark:text-white">
//                   11 Rosewood Drive, New York, NY 45568
//                 </p>
//                 <p className="text-black dark:text-white">(555) 595-5999</p>
//               </div>
//               <div className="mt-4 text-gray-700 dark:text-gray-300 lg:mt-0 lg:mx-6">
//                 <p>Date issued: MM/DD/YYYY</p>
//                 <p>Age/gender: 45/Male</p>
//                 <p>Admission: MM/DD/YYYY</p>
//               </div>
//               {/* Right Column: Doctor Info & Meta */}
//               <div className="flex-1 border-l-2 border-[#0EFF7B] pl-4">
//                 <p className="text-[#0EFF7B] font-semibold mb-2">
//                   DOCTOR INFORMATION
//                 </p>
//                 <p className="text-black dark:text-white">Dr. Alanah</p>
//                 <p className="text-black dark:text-white">Cardiologist</p>
//                 <p className="text-black dark:text-white">Stacklycare, USA</p>

//                 {/* Invoice Meta */}
//               </div>
//             </div>

//             {/* Invoice Table */}
//             <table className="min-w-full border-separate border-spacing-x-1 bg-transparent text-black dark:text-white">
//               <thead>
//                 <tr className="text-left text-[#0EFF7B] border-b border-gray-300 dark:border-gray-700">
//                   <th className="py-3">Serial No.</th>
//                   <th className="py-3">Service / Item</th>
//                   <th className="py-3">Qty</th>
//                   <th className="py-3">Unit price</th>
//                   <th className="py-3">Tax</th>
//                   <th className="py-3">Total</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {[
//                   {
//                     sn: 1,
//                     item: "Consultation",
//                     qty: "-",
//                     price: "-",
//                     tax: "120.00",
//                     total: "1500.00",
//                   },
//                   {
//                     sn: 2,
//                     item: "Blood test (CBC)",
//                     qty: 3,
//                     price: "1500",
//                     tax: "80.00",
//                     total: "4500.00",
//                   },
//                   {
//                     sn: 3,
//                     item: "X-ray chest",
//                     qty: "-",
//                     price: "-",
//                     tax: "50.00",
//                     total: "3500.00",
//                   },
//                   {
//                     sn: 4,
//                     item: "Medicines",
//                     qty: 8,
//                     price: "1000",
//                     tax: "450.00",
//                     total: "8000.00",
//                   },
//                   {
//                     sn: 5,
//                     item: "Room charges (5 days)",
//                     qty: 5,
//                     price: "2500",
//                     tax: "450.00",
//                     total: "12500.00",
//                   },
//                 ].map((row) => (
//                   <tr
//                     key={row.sn}
//                     className="border-b border-gray-200 dark:border-gray-700"
//                   >
//                     <td className="py-3">{row.sn}.</td>
//                     <td className="py-3">{row.item}</td>
//                     <td className="py-3">{row.qty}</td>
//                     <td className="py-3">{row.price}</td>
//                     <td className="py-3">{row.tax}</td>
//                     <td className="py-3">{row.total}</td>
//                   </tr>
//                 ))}
//                 {/* Total Row */}
//                 <tr>
//                   <td colSpan="5" className="text-right font-semibold py-3">
//                     Total
//                   </td>
//                   <td className="py-3 font-semibold">30000.00</td>
//                 </tr>
//               </tbody>
//             </table>

//             {/* Grand Total */}
//             <div className="mt-4 flex justify-end">
//               <div className="bg-[#0EFF7B] text-black dark:text-white px-6 py-3 rounded-lg font-semibold">
//                 Grand total: 41500.00
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === "Test Reports" && (
//           <div className="overflow-x-auto rounded-xl p-4 mb-4 bg-transparent">
//             {/* Filters + Text */}
//             <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
//               {/* Left side: Text */}
//               <p className="text-gray-600 dark:text-[#A0A0A0] text-[16px]">
//                 Patients test report information.
//               </p>

//               {/* Right side: Dropdowns */}
//               <div className="flex flex-col sm:flex-row gap-4 mt-2 sm:mt-0">
//                 {[
//                   {
//                     label: "Month",
//                     value: selectedMonth,
//                     setValue: setSelectedMonth,
//                     options: ["All", "April", "May", "June"],
//                   },
//                   {
//                     label: "Department",
//                     value: selectedDepartment,
//                     setValue: setSelectedDepartment,
//                     options: ["All", "Pathology", "Radiology"],
//                   },
//                   {
//                     label: "Status",
//                     value: selectedStatus,
//                     setValue: setSelectedStatus,
//                     options: ["All", "Completed", "Pending", "Cancelled"],
//                   },
//                 ].map(({ label, value, setValue, options }) => (
//                   <div key={label} className="relative">
//                     <select
//                       value={value}
//                       onChange={(e) => setValue(e.target.value)}
//                       className="appearance-none w-[140px] bg-gradient-to-r from-[#025126] via-[#0D7F41] to-[#025126]
//                 border border-[#0EFF7B] text-white text-sm rounded-lg px-4 py-2.5 pr-8
//                 focus:outline-none focus:ring-2 focus:ring-[#0EFF7B] hover:shadow-[0_0_8px_#0EFF7B]
//                 dark:bg-gradient-to-r dark:from-[#002414] dark:via-[#003D24] dark:to-[#002414]"
//                     >
//                       {options.map((opt) => (
//                         <option
//                           key={opt}
//                           value={opt}
//                           className="bg-gray-100 dark:bg-black text-black dark:text-white"
//                         >
//                           {opt === "All" ? `All ${label}s` : opt}
//                         </option>
//                       ))}
//                     </select>
//                     <svg
//                       className="absolute right-3 top-3 w-4 h-4 text-[#0EFF7B] pointer-events-none"
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M19 9l-7 7-7-7"
//                       />
//                     </svg>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Table */}
//             <table className="min-w-full border-separate border-spacing-x-1 bg-transparent">
//               <thead>
//                 <tr className="text-left text-[16px] text-[#08994A] dark:text-[#0EFF7B] border-b border-gray-300 dark:border-gray-700">
//                   <th className="py-3">Date & Time</th>
//                   <th className="py-3">Month</th>
//                   <th className="py-3">Test Type</th>
//                   <th className="py-3">Department</th>
//                   <th className="py-3">Status</th>
//                 </tr>
//               </thead>
//               <tbody className="text-[16px] text-black dark:text-white">
//                 {currentTests.length > 0 ? (
//                   currentTests.map((report, index) => (
//                     <tr
//                       key={index}
//                       className="border-b border-gray-200 dark:border-gray-700"
//                     >
//                       <td className="py-4">{report.dateTime}</td>
//                       <td className="py-4">{report.month}</td>
//                       <td className="py-4">{report.testType}</td>
//                       <td className="py-4">{report.department}</td>
//                       <td className="py-4">
//                         <span
//                           className={`inline-block px-3 py-1 text-xs font-semibold rounded-full
//                     ${
//                       report.status === "Completed"
//                         ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
//                         : report.status === "Pending"
//                         ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
//                         : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
//                     }`}
//                         >
//                           {report.status}
//                         </span>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td
//                       colSpan="5"
//                       className="text-center py-6 text-gray-600 dark:text-gray-400 italic"
//                     >
//                       No test reports found
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

//Pages/patients/ViewPatientProfile.jsx
//Pages/patients/ViewPatientProfile.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/axiosConfig";
import {
  ClipboardList,
  FileText,
  Receipt,
  TestTube2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ChevronDown,
  Menu,
  X,
  HeartPulse,
  Scale,
  Ruler,
  Thermometer,
  History,
  Eye,
  Download,
  Scissors,
} from "lucide-react";
import { Listbox } from "@headlessui/react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function ViewPatientProfile() {
  const { patient_id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Prescription");
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 
  // Tab Data
  const [diagnoses, setDiagnoses] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [testReports, setTestReports] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedInvoiceIndex, setSelectedInvoiceIndex] = useState(0);
 
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPrescriptionPage, setCurrentPrescriptionPage] = useState(1);
  const [currentTestPage, setCurrentTestPage] = useState(1);
  const [currentHistoryPage, setCurrentHistoryPage] = useState(1);
  const itemsPerPage = 5;
 
  // Filters
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
 
  // Dynamic Departments
  const [departments, setDepartments] = useState(["All"]);
 
  // Responsive state
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth < 768;
  const [surgeries, setSurgeries] = useState([]);
  const [currentSurgeryPage, setCurrentSurgeryPage] = useState(1);
  // Update window width on resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // Fetch Departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get(
          "/medicine_allocation/departments/"
        );
        setDepartments(["All", ...res.data]);
      } catch (err) {
        console.error("Failed to load departments", err);
        if (err.response) {
          if (err.response.status === 401) {
            console.error("Authentication failed.");
          } else if (err.response.status === 404) {
            console.error("Departments endpoint not found.");
          } else {
            console.error(`Server error: ${err.response.status}`);
          }
        } else if (err.request) {
          console.error("No response from server.");
        } else {
          console.error("Failed to load departments");
        }
        setDepartments(["All", "Pathology", "Radiology"]);
      }
    };
    fetchDepartments();
  }, []);
  // Fetch Patient
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await api.get(`/patients/${patient_id}`);
        setPatient(res.data);
      } catch (err) {
        console.error("Failed to load patient", err);
        if (err.response) {
          if (err.response.status === 401) {
            console.error("Authentication failed.");
          } else if (err.response.status === 404) {
            console.error("Patient not found.");
          } else {
            console.error(`Server error: ${err.response.status}`);
          }
        } else if (err.request) {
          console.error("No response from server.");
        } else {
          console.error("Failed to load patient");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [patient_id]);
  // Fetch All Data including Invoices and History
  useEffect(() => {
  if (!patient) return;
 
  const fetchTabData = async () => {
    setDataLoading(true);
    try {
      // Fetch all data in parallel but handle errors individually
      const promises = [
        api.get(`/medicine_allocation/${patient_id}/diagnoses/`)
          .catch(err => {
            console.error("Failed to load diagnoses:", err);
            return { data: [] };
          }),
        api.get(`/medicine_allocation/${patient_id}/prescriptions/`)
          .catch(err => {
            console.error("Failed to load prescriptions:", err);
            return { data: [] };
          }),
        api.get(`/medicine_allocation/${patient_id}/test-reports/`)
          .catch(err => {
            console.error("Failed to load test reports:", err);
            return { data: [] };
          }),
        api.get(`/medicine_allocation/${patient_id}/all-invoices/`)
          .catch(err => {
            console.error("Failed to load invoices:", err);
            return { data: [] };
          }),
        api.get(`/patients/${patient_id}/history?page=1&limit=20`)
          .catch(err => {
            console.error("Failed to load history:", err);
            return { data: { history: [] } };
          }),
        api.get(`/patients/${patient_id}/surgeries`)
          .catch(err => {
            console.warn("Surgeries API not available or error:", err.message);
            return { data: [] }; // Return empty array if API fails
          })
      ];
     
      const [diagRes, presRes, testRes, invRes, histRes, surgRes] = await Promise.all(promises);
     
      setDiagnoses(diagRes.data || []);
      setPrescriptions(presRes.data || []);
      setTestReports(testRes.data || []);
      setInvoices(invRes.data || []);
      setHistory(histRes.data?.history || []);
      setSurgeries(surgRes.data || []); // This should work now
     
      // Auto-select latest invoice
      if (invRes.data.length > 0) {
        setSelectedInvoiceIndex(0);
      }
     
      // Reset pagination to first page on data load
      setCurrentPage(1);
      setCurrentPrescriptionPage(1);
      setCurrentTestPage(1);
      setCurrentHistoryPage(1);
      setCurrentSurgeryPage(1);
    } catch (err) {
      console.error("Failed to load tab data", err);
      if (err.response) {
        if (err.response.status === 401) {
          console.error("Authentication failed.");
        } else if (err.response.status === 404) {
          console.error("Resource not found.");
        } else {
          console.error(`Server error: ${err.response.status}`);
        }
      } else if (err.request) {
        console.error("No response from server.");
      } else {
        console.error("Failed to load tab data");
      }
      // Set empty arrays for all data to prevent further errors
      setDiagnoses([]);
      setPrescriptions([]);
      setTestReports([]);
      setInvoices([]);
      setHistory([]);
      setSurgeries([]);
    } finally {
      setDataLoading(false);
    }
  };
 
  fetchTabData();
}, [patient, patient_id]);
  // Reset test page on filter change
  useEffect(() => {
    setCurrentTestPage(1);
  }, [selectedMonth, selectedDepartment, selectedStatus]);
  // Function to extract filename from path
  const extractFilenameFromPath = (filePath) => {
    if (!filePath) return null;
    // Extract filename from path like "/uploads/lab_reports/e3afa669669-c08c-4d2e-ae44-8fbc88caa15c.jpg"
    const parts = filePath.split('/');
    return parts[parts.length - 1];
  };
  // Function to construct file path from report ID
  const constructFilePath = (reportId) => {
    // Construct the file path based on your database pattern
    // Assuming file path pattern: /uploads/lab_reports/{uuid}.{extension}
    // Since we don't have the actual filename in the response, we'll need to get it from the server
    // For now, return null - we'll need to fetch the actual path
    return null;
  };
  // Function to get file path for a report
  const getReportFilePath = async (reportId) => {
    try {
      // First, try to get the actual file path from the server
      const response = await api.get(`/labreports/${reportId}/path`);
      return response.data.file_path;
    } catch (error) {
      console.error("Error fetching file path:", error);
      if (error.response) {
        if (error.response.status === 401) {
          console.error("Authentication failed.");
        } else if (error.response.status === 404) {
          console.error("File path not found.");
        } else {
          console.error(`Server error: ${error.response.status}`);
        }
      } else if (error.request) {
        console.error("No response from server.");
      } else {
        console.error("Failed to fetch file path");
      }
      return null;
    }
  };
  // Function to view lab report (opens in new tab)
  const handleViewReport = async (reportId, orderId) => {
    if (!reportId) return;
    try {
      // First, get the file path for this report
      const filePath = await getReportFilePath(reportId);
      if (!filePath) {
        console.error("No file path found for report:", reportId);
        alert("Report file not found on server");
        return;
      }
     
      // Directly use the file path from backend
      const url = `${API_BASE}${filePath.startsWith('/') ? filePath : '/' + filePath}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error("Error viewing report:", error);
      alert("Error loading report. Please try again.");
    }
  };
  // Function to download lab report
  const handleDownloadReport = async (reportId, orderId, testType) => {
    if (!reportId) return;
    try {
      // First, get the file path for this report
      const filePath = await getReportFilePath(reportId);
      if (!filePath) {
        console.error("No file path found for report:", reportId);
        alert("Report file not found on server");
        return;
      }
     
      const filename = extractFilenameFromPath(filePath);
      if (!filename) {
        console.error("Could not extract filename from path:", filePath);
        return;
      }
     
      const downloadUrl = `${API_BASE}${filePath.startsWith('/') ? filePath : '/' + filePath}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
     
      // Extract file extension
      const fileExtension = filename.split('.').pop();
      const cleanReportName = (testType || `Report_${reportId}`).replace(/[^a-zA-Z0-9]/g, '_');
     
      // Set appropriate filename for download
      link.download = `${cleanReportName}.${fileExtension}`;
      link.target = '_blank';
     
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading report:", error);
      alert("Error downloading report. Please try again.");
    }
  };
  // Alternative: Simple view/download if you want to skip the API call for file path
  const handleViewReportSimple = (reportId) => {
    // This assumes you have an endpoint that serves the file by report ID
    const url = `${API_BASE}/labreports/${reportId}/view`;
    window.open(url, '_blank');
  };
  const handleDownloadReportSimple = (reportId, testType) => {
    const url = `${API_BASE}/labreports/${reportId}/download`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(testType || `Report_${reportId}`).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const formatSurgeryDate = (dateString) => {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return dateString; // Return as-is if parsing fails
  }
};
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#0EFF7B] mb-4"></div>
      </div>
    );
  
  if (!patient)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Patient not found
      </div>
    );
  // Pagination Helpers
  const paginate = (items, page) =>
    items.slice((page - 1) * itemsPerPage, page * itemsPerPage);
 
  const totalPages = (items) => Math.ceil(items.length / itemsPerPage);
 
  const currentDiagnoses = paginate(diagnoses, currentPage);
  const currentPrescriptions = paginate(prescriptions, currentPrescriptionPage);
  const currentHistory = paginate(history, currentHistoryPage);
  const currentSurgeries = paginate(surgeries, currentSurgeryPage);
 
  const filteredTests = testReports.filter(
    (t) =>
      (selectedMonth === "All" || t.month === selectedMonth) &&
      (selectedDepartment === "All" || t.department === selectedDepartment) &&
      (selectedStatus === "All" || t.status === selectedStatus)
  );
 
  const currentTests = paginate(filteredTests, currentTestPage);
  const currentInvoice = invoices.length > 0 ? invoices[selectedInvoiceIndex] : null;
  // Dynamic Vitals Data
  const vitalsData = [
    {
      icon: HeartPulse,
      label: "Blood Pressure",
      value: patient.blood_pressure || "—",
      unit: "mmHg",
    },
    {
      icon: Scale,
      label: "Weight",
      value: patient.weight_in_kg ? patient.weight_in_kg.toString() : "—",
      unit: "kg",
    },
    {
      icon: Ruler,
      label: "Height",
      value: patient.height_in_cm ? patient.height_in_cm.toString() : "—",
      unit: "cm",
    },
    {
      icon: Thermometer,
      label: "Temperature",
      value: patient.body_temperature ? patient.body_temperature.toString() : "—",
      unit: "°C",
    },
  ];
  // Reusable Listbox Component
  const FilterListbox = ({ value, onChange, options, label }) => (
    <Listbox value={value} onChange={onChange}>
      <div className="relative w-full sm:w-[164px]">
        <Listbox.Button className="w-full h-[40px] rounded-[8px] bg-[#025126] text-white text-[14px] sm:text-[16px] flex items-center justify-between px-4 border border-[#0EFF7B]">
          <span className="truncate">{value || `All ${label}s`}</span>
          <ChevronDown className="h-5 w-5 text-[#0EFF7B] flex-shrink-0" />
        </Listbox.Button>
        <Listbox.Options className="absolute mt-1 w-full rounded-md bg-white dark:bg-black shadow-lg z-50 border border-[#0EFF7B] max-h-60 overflow-auto">
          {options.map((opt) => (
            <Listbox.Option
              key={opt}
              value={opt}
              className={({ active }) =>
                `cursor-pointer select-none py-2 px-4 text-sm ${
                  active
                    ? "bg-[#0EFF7B1A] text-[#08994A]"
                    : "text-black dark:text-white"
                }`
              }
            >
              {opt}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
  // Responsive Table Component
  const ResponsiveTable = ({ children, headers, mobileData }) => {
    if (isMobile) {
      return (
        <div className="space-y-4">
          {mobileData.map((row, idx) => (
            <div key={idx} className="bg-white dark:bg-[#0F0F0F] rounded-lg p-4 border border-[#0EFF7B]/20 shadow">
              {row.map((cell, cellIdx) => (
                <div key={cellIdx} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <span className="font-medium text-gray-600 dark:text-gray-400">{headers[cellIdx]}:</span>
                  <span className="text-right max-w-[60%] truncate">{cell}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }
  
    return (
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="min-w-full inline-block align-middle">
          <table className="min-w-full">
            {children}
          </table>
        </div>
      </div>
    );
  };
  // Mobile Navigation
  const MobileTabs = () => (
  <div className="md:hidden">
    <button
      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      className="w-full flex items-center justify-between bg-[#025126] text-white p-4 rounded-lg mb-4"
    >
      <span>{activeTab}</span>
      {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
    </button>
  
    {mobileMenuOpen && (
      <div className="bg-white dark:bg-[#0F0F0F] rounded-lg shadow-lg p-2 mb-4 border border-[#0EFF7B]/20">
        {[
          { name: "Prescription", icon: FileText },
          { name: "Invoice", icon: Receipt },
          { name: "Test Reports", icon: TestTube2 },
          { name: "Surgeries", icon: Scissors }, // Add this
          { name: "History", icon: History },
        ].map(({ name, icon: Icon }) => (
          <button
            key={name}
            onClick={() => {
              setActiveTab(name);
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 p-3 rounded-lg mb-1 last:mb-0 ${
              activeTab === name
                ? "bg-[#0EFF7B14] text-[#0EFF7B]"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Icon size={20} />
            <span>{name}</span>
          </button>
        ))}
      </div>
    )}
  </div>
);
  return (
    <div className=" mb-4 bg-white dark:bg-black text-black dark:text-white rounded-xl p-3 sm:p-4 w-full mx-auto flex flex-col overflow-hidden relative font-[Helvetica]">
      {/* Gradient Background */}
      <div
        className="absolute inset-0 rounded-[8px] pointer-events-none dark:block hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(3,56,27,0.25) 16%, rgba(15,15,15,0.25) 48.97%)",
          zIndex: 0,
        }}
      />
    
      {/* Gradient Border - FIXED for responsiveness */}
      <div
        className="absolute inset-0 rounded-[10px] pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom right, rgba(14,255,123,0.7) 0%, rgba(30,30,30,0.7) 50%, rgba(14,255,123,0.7) 100%)",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "2px",
          zIndex: 0,
        }}
      />
     
      {/* Back Button */}
      <button
        onClick={() => {
          if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
          } else {
            navigate("/patients");
          }
        }}
        className="flex mt-4 items-center gap-2 w-[92px] h-[40px] rounded-[8px] px-3 border-b-[2px] border-[#0EFF7B] shadow-[0_2px_12px_0px_#00000040] text-white font-medium text-[14px] leading-[16px] transition-transform hover:scale-105 mb-6"
        style={{
          background: "linear-gradient(92.18deg, #025126 3.26%, #0D7F41 50.54%, #025126 97.83%)",
        }}
      >
        <ArrowLeft size={18} />
        Back
      </button>
     
      {/* Profile Card - FIXED WIDTH ISSUE */}
      <div className="relative mb-6 h-auto sm:mb-8 w-full bg-white dark:bg-transparent border border-[#0EFF7B] dark:border-[#0EFF7B1A] mx-auto flex flex-col lg:flex-row items-center lg:items-start text-black dark:text-white rounded-[20px] p-4 sm:p-6 lg:p-8 dark:shadow-[0_0_4px_0_#FFFFFF1F] overflow-hidden relative z-10">
        {/* Avatar Section */}
        <div className="w-full lg:w-auto flex flex-col items-center mb-2 lg:mb-0 lg:mr-8">
          <div className="w-[80px] h-[80px] sm:w-[94px] sm:h-[94px] rounded-full overflow-hidden bg-gray-200 border-2 border-[#0EFF7B]">
            <img
              src={patient.photo_url || "/default-avatar.png"}
              alt={patient.full_name}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-[#08994A] dark:text-[#0EFF7B] text-[18px] font-medium mt-2">
            {patient.full_name}
          </span>
          <span className="text-[14px] text-gray-600 dark:text-[#A0A0A0]">
            ID: {patient.patient_unique_id}
          </span>
          <span className="text-[14px] text-gray-600 dark:text-[#A0A0A0]">
            {patient.email_address || "—"}
          </span>
        </div>
       
        {/* Vertical Separator - Only on large screens */}
        {windowWidth >= 1320 && (
          <div className="hidden lg:block w-[1px] h-[240px] bg-gray-300 dark:bg-[#A0A0A0] mr-8" />
        )}
       
        {/* Info Grid - Responsive */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-4 lg:mt-0">
          {[
            { label: "Gender", value: patient.gender },
            { label: "Age", value: patient.age },
            { label: "Blood Group", value: patient.blood_group },
            { label: "Phone number", value: patient.phone_number },
            { label: "Status", value: patient.casualty_status },
            { label: "Department", value: patient.department__name },
            { label: "Admission date", value: patient.admission_date },
            { label: "Bed Number", value: patient.room_number },
            { label: "Visiting Doctor", value: patient.staff__full_name },
            { label: "Consultation type", value: patient.consultation_type },
          ].map((item, i) => (
            <div key={i} className="p-2 sm:p-3">
              <p className="text-[14px] sm:text-[16px] text-[#0EFF7B] font-semibold mb-1">
                {item.label}
              </p>
              <p className="text-[12px] sm:text-[14px] text-black dark:text-white truncate">
                {item.value || "—"}
              </p>
            </div>
          ))}
        </div>
      </div>
     
      {/* Vitals Section */}
      <div className="mb-6 sm:mb-8 relative z-10">
        <h1 className="text-black dark:text-white text-xl font-semibold mb-4">
          Patient Current Vitals
        </h1>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {vitalsData.map((vital, i) => (
            <div
              key={i}
              className="w-full h-[88px] bg-white dark:bg-[#0D0D0D] border border-[#0EFF7B] dark:border-[#0EFF7B66] rounded-[8px] flex items-center justify-between px-4 gap-3"
              style={{
                backgroundColor: "rgba(14, 255, 123, 0.02)",
              }}
            >
              <vital.icon
                className="w-[40px] h-[40px] sm:w-[45px] sm:h-[45px] text-[#0EFF7B]"
              />
              <div className="flex flex-col justify-center items-end space-y-1">
                <span className="text-[14px] sm:text-[16px] lg:text-[18px] text-white font-medium">
                  {vital.label}
                </span>
                <span className="text-[18px] sm:text-[20px] lg:text-[22px] text-[#0EFF7B] font-bold leading-none">
                  {vital.value}
                  {vital.value !== "—" && (
                    <span className="text-[14px] sm:text-[16px] lg:text-[18px] text-white font-normal ml-1">
                      {vital.unit}
                    </span>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
     
      {/* Main Tabs Container - FIXED WIDTH ISSUE */}
      <div className="w-full bg-white dark:bg-black text-black dark:text-white border border-[#0EFF7B] dark:border-[#0EFF7B1A] rounded-xl p-3 sm:p-4 flex flex-col bg-white dark:bg-transparent overflow-visible relative z-10">
        {/* Mobile Navigation */}
        <MobileTabs />
       
        {/* Desktop Tabs */}
        <div className="hidden md:block w-full overflow-x-auto mb-6 sm:mb-8">
  <div className="flex justify-start sm:justify-center min-w-max">
    {[
      { name: "Prescription", icon: FileText },
      { name: "Invoice", icon: Receipt },
      { name: "Test Reports", icon: TestTube2 },
      { name: "Surgeries", icon: Scissors }, // Add this
      { name: "History", icon: History },
    ].map(({ name, icon: Icon }) => (
      <button
        key={name}
        onClick={() => setActiveTab(name)}
        className={`relative min-w-[120px] sm:min-w-[140px] lg:min-w-[160px] h-[40px] flex items-center justify-center gap-2 rounded-lg px-3 mx-1 text-sm font-medium transition-all ${
          activeTab === name
            ? "bg-[#0EFF7B14] text-[#0EFF7B]"
            : "text-[#0EFF7B] hover:text-green-600 dark:text-[#0EFF7B]"
        }`}
        style={{
          borderBottom: "1px solid",
          borderImageSlice: 1,
          borderImageSource:
            "linear-gradient(90.03deg, #000000 0%, #0EFF7B 49.98%, #000000 99.96%)",
        }}
      >
        <Icon size={18} className="text-[#0EFF7B]" />
        <span className="hidden sm:inline">{name}</span>
        <span className="sm:hidden">{name.substring(0, 3)}</span>
      </button>
    ))}
  </div>
</div>
       
        {dataLoading && (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            Loading records...
          </div>
        )}
       
       
        {/* === PRESCRIPTION TAB === */}
        {activeTab === "Prescription" && !dataLoading && (
          <div className="rounded-xl p-3 sm:p-4 mb-4 bg-transparent">
            <p className="text-gray-600 dark:text-[#A0A0A0] text-[14px] sm:text-[16px] mb-4">
              Patient's prescription details.
            </p>
            {prescriptions.length === 0 ? (
              <p className="text-center py-6 text-gray-600 dark:text-gray-400 italic">
                No prescriptions found
              </p>
            ) : (
              <>
                <ResponsiveTable
                  headers={["Date", "Medicine", "Dosage", "Quantity", "Timing", "Frequency", "Status"]}
                  mobileData={currentPrescriptions.map(p => [
                    p.date,
                    p.prescription,
                    p.dosage,
                    p.quantity,
                    p.timing,
                    p.frequency,
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                        p.status === "Completed"
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : p.status === "Pending"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                      }`}
                    >
                      {p.status}
                    </span>
                  ])}
                >
                  <thead>
                    <tr className="text-left text-[14px] sm:text-[16px] text-[#08994A] dark:text-[#0EFF7B] border-b border-gray-300 dark:border-gray-700">
                      <th className="py-3 px-2 sm:px-4">Date</th>
                      <th className="py-3 px-2 sm:px-4">Medicine</th>
                      <th className="py-3 px-2 sm:px-4">Dosage</th>
                      <th className="py-3 px-2 sm:px-4">Quantity</th>
                      <th className="py-3 px-2 sm:px-4">Timing</th>
                      <th className="py-3 px-2 sm:px-4">Frequency</th>
                      <th className="py-3 px-2 sm:px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-[14px] sm:text-[16px] text-black dark:text-white">
                    {currentPrescriptions.map((p, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-200 dark:border-gray-700"
                      >
                        <td className="py-3 px-2 sm:px-4">{p.date}</td>
                        <td className="py-3 px-2 sm:px-4">{p.prescription}</td>
                        <td className="py-3 px-2 sm:px-4">{p.dosage}</td>
                        <td className="py-3 px-2 sm:px-4">{p.quantity}</td>
                        <td className="py-3 px-2 sm:px-4">{p.timing}</td>
                        <td className="py-3 px-2 sm:px-4">{p.frequency}</td>
                        <td className="py-3 px-2 sm:px-4">
                          <span
                            className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                              p.status === "Completed"
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : p.status === "Pending"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </ResponsiveTable>
                <div className="flex items-center mt-4 gap-x-4">
                  <div className="text-sm text-black dark:text-white">
                    Page {currentPrescriptionPage} of {totalPages(prescriptions)}
                  </div>
                  <div className="flex items-center gap-x-2">
                    <button
                      onClick={() => setCurrentPrescriptionPage(Math.max(1, currentPrescriptionPage - 1))}
                      disabled={currentPrescriptionPage === 1}
                      className="p-1 rounded-full border border-[#0EFF7B] disabled:opacity-50"
                    >
                      <ChevronLeft size={12} />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPrescriptionPage(
                          Math.min(totalPages(prescriptions), currentPrescriptionPage + 1)
                        )
                      }
                      disabled={currentPrescriptionPage === totalPages(prescriptions)}
                      className="p-1 rounded-full border border-[#0EFF7B] disabled:opacity-50"
                    >
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
       
        {/* === INVOICE TAB === */}
        {activeTab === "Invoice" && !dataLoading && (
          <div className="rounded-xl p-3 sm:p-4 lg:p-6 mb-4 lg:mb-8 bg-gradient-to-br from-transparent via-white/5 to-transparent">
            {invoices.length === 0 ? (
              <p className="text-center py-12 lg:py-20 text-gray-600 dark:text-gray-400 italic text-base lg:text-lg font-medium">
                No invoices found
              </p>
            ) : (
              <>
                {/* Invoice Selector */}
                <div className="flex justify-center lg:justify-end mb-4 lg:mb-8">
                  <div className="relative w-full lg:min-w-[300px] lg:w-[380px] xl:w-[420px]">
                    <Listbox
                      value={selectedInvoiceIndex}
                      onChange={(value) => setSelectedInvoiceIndex(value)}
                    >
                      <Listbox.Button className="w-full h-[48px] rounded-xl border-2 border-[#0EFF7B] bg-[#025126] text-white shadow-[0_0_8px_#0EFF7B40] outline-none focus:border-[#0EFF7B] focus:shadow-[0_0_12px_#0EFF7B60] transition-all duration-300 px-4 lg:px-6 pr-12 font-medium text-sm text-left relative hover:shadow-[0_0_16px_#0EFF7B50] flex items-center justify-between">
                        <span className="truncate text-xs lg:text-sm">
                          {invoices.length > 0
                            ? `${invoices[
                                selectedInvoiceIndex
                              ]?.type.toUpperCase()} • ${
                                invoices[selectedInvoiceIndex]?.invoice_number
                              } • ${
                                invoices[selectedInvoiceIndex]?.display_date
                              }`
                            : "Select Invoice"}
                        </span>
                        <ChevronDown className="absolute right-4 w-5 h-5 text-[#0EFF7B]" />
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-50 mt-2 w-full bg-white dark:bg-black border-2 border-[#0EFF7B] rounded-xl shadow-2xl shadow-[#0EFF7B]/30 max-h-60 overflow-auto text-sm font-medium py-2 top-[100%] left-0">
                        {invoices.map((inv, idx) => (
                          <Listbox.Option
                            key={idx}
                            value={idx}
                            className={({ active }) =>
                              `cursor-pointer select-none px-4 lg:px-6 py-3 transition-all duration-200 flex items-center justify-between ${
                                active
                                  ? "bg-[#0EFF7B]/10 text-[#0EFF7B]"
                                  : "text-gray-800 dark:text-gray-200"
                              }`
                            }
                          >
                            {({ selected }) => (
                              <>
                                <span className={`truncate ${selected ? "font-bold" : "font-medium"} text-xs lg:text-sm`}>
                                  {inv.type.toUpperCase()} • {inv.invoice_number} • {inv.display_date}
                                </span>
                                {selected && (
                                  <div className="w-5 h-5 bg-[#0EFF7B] rounded-full flex items-center justify-center flex-shrink-0">
                                    <div className="w-2 h-2 bg-black rounded-full" />
                                  </div>
                                )}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Listbox>
                  </div>
                </div>
                {currentInvoice && (
                  <>
                    {/* Invoice Header */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 lg:mb-10 gap-4 lg:gap-6">
                      <div className="w-full lg:w-auto">
                        <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold text-[#0EFF7B] tracking-tight">
                          Invoice #{currentInvoice.invoice_number}
                        </h2>
                        <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1 lg:mt-2">
                          Issued: {currentInvoice.display_date} • {currentInvoice.type.toUpperCase()} Invoice
                        </p>
                      </div>
                      <div className="bg-[#0EFF7B] text-black px-4 lg:px-8 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-bold text-lg lg:text-xl xl:text-2xl shadow-xl w-full lg:w-auto text-center">
                        Total: ${currentInvoice.grand_total || currentInvoice.net_amount || "0.00"}
                      </div>
                    </div>
                    {/* Patient Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 xl:gap-8 mb-4 lg:mb-10 bg-white dark:bg-[#0F0F0F]/50 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-[#0EFF7B]/20 shadow">
                      <div className="border-l-4 border-[#0EFF7B] pl-3 lg:pl-6">
                        <h3 className="text-base lg:text-lg xl:text-xl font-bold text-[#0EFF7B] mb-2 lg:mb-4 tracking-wide">PATIENT</h3>
                        <p className="text-sm lg:text-base xl:text-lg font-semibold text-gray-900 dark:text-white">
                          {currentInvoice.patient_name || patient.full_name}
                        </p>
                        <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">
                          ID: {currentInvoice.patient_id}
                        </p>
                        <p className="text-xs lg:text-sm text-gray-700 dark:text-gray-300 mt-1">
                          {currentInvoice.patient?.address || patient.address || "—"}
                        </p>
                        <p className="text-xs lg:text-sm text-gray-700 dark:text-gray-300">
                          {currentInvoice.patient?.phone || patient.phone_number || "—"}
                        </p>
                      </div>
                      <div className="text-center space-y-3 lg:space-y-6">
                        <div>
                          <p className="text-xs lg:text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Age / Gender
                          </p>
                          <p className="text-lg lg:text-xl xl:text-2xl font-bold text-[#0EFF7B] mt-1 lg:mt-2">
                            {patient.age} yrs / {patient.gender}
                          </p>
                        </div>
                        {currentInvoice.admission_date && (
                          <div>
                            <p className="text-xs lg:text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">
                              Admission
                            </p>
                            <p className="text-sm lg:text-base xl:text-xl font-semibold text-gray-900 dark:text-white mt-1 lg:mt-2">
                              {currentInvoice.admission_date}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="border-l-4 border-[#0EFF7B] pl-3 lg:pl-6">
                        <h3 className="text-base lg:text-lg xl:text-xl font-bold text-[#0EFF7B] mb-2 lg:mb-4 tracking-wide">DOCTOR</h3>
                        <p className="text-sm lg:text-base xl:text-lg font-semibold text-gray-900 dark:text-white">
                          {currentInvoice.doctor || currentInvoice.doctor_name || "—"}
                        </p>
                        <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1 lg:mt-2">
                          {patient.department?.name || "General Medicine"}
                        </p>
                        <p className="text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 mt-2 lg:mt-3">
                          Stacklycare Hospital
                        </p>
                      </div>
                    </div>
                    {/* Items Table */}
                    <div className="overflow-x-auto rounded-xl lg:rounded-2xl border border-[#0EFF7B]/20 shadow bg-white dark:bg-[#0F0F0F] mb-4 lg:mb-6">
                      <table className="min-w-full">
                        <thead className="bg-gradient-to-r from-[#025126] to-[#025126]/80 text-white">
                          <tr>
                            <th className="py-3 px-2 lg:px-4 text-left font-semibold text-xs lg:text-sm">S/N</th>
                            <th className="py-3 px-2 lg:px-4 text-left font-semibold text-xs lg:text-sm">Item</th>
                            <th className="py-3 px-2 lg:px-4 text-center font-semibold text-xs lg:text-sm">Qty</th>
                            <th className="py-3 px-2 lg:px-4 text-right font-semibold text-xs lg:text-sm">Price</th>
                            <th className="py-3 px-2 lg:px-4 text-right font-semibold text-xs lg:text-sm">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                          {currentInvoice.items && currentInvoice.items.length > 0 ? (
                            currentInvoice.items.map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-[#1A1A1A]">
                                <td className="py-3 px-2 lg:px-4 text-xs lg:text-sm text-gray-700 dark:text-gray-300">
                                  {index + 1}
                                </td>
                                <td className="py-3 px-2 lg:px-4 font-medium text-xs lg:text-sm text-gray-900 dark:text-white">
                                  {item.item || item.drug_name || item.description || "Service Charge"}
                                </td>
                                <td className="py-3 px-2 lg:px-4 text-center text-xs lg:text-sm text-gray-800 dark:text-gray-200">
                                  {item.qty || item.quantity || 1}
                                </td>
                                <td className="py-3 px-2 lg:px-4 text-right text-xs lg:text-sm text-gray-800 dark:text-gray-200">
                                  ${item.price || item.unit_price || "0.00"}
                                </td>
                                <td className="py-3 px-2 lg:px-4 text-right text-xs lg:text-sm font-bold text-[#0EFF7B]">
                                  ${item.total || item.line_total || "0.00"}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="text-center py-8 text-gray-500">
                                No item details available
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    {/* Totals Summary */}
                    <div className="flex justify-center lg:justify-end">
                      <div className="w-full lg:max-w-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0F0F0F] dark:to-[#1A1A1A] rounded-xl lg:rounded-2xl p-4 lg:p-8 border-2 border-[#0EFF7B]/30 shadow">
                        <div className="space-y-2 lg:space-y-4">
                          <div className="flex justify-between text-sm lg:text-base">
                            <span className="font-medium">Subtotal</span>
                            <span>${currentInvoice.subtotal || currentInvoice.amount || "0.00"}</span>
                          </div>
                        
                          {currentInvoice.tax_amount > 0 && (
                            <div className="flex justify-between text-xs lg:text-sm">
                              <span>Tax ({currentInvoice.tax_percent || 18}%)</span>
                              <span>${currentInvoice.tax_amount || "0.00"}</span>
                            </div>
                          )}
                        
                          {currentInvoice.discount_amount > 0 && (
                            <div className="flex justify-between text-xs lg:text-sm text-red-600 font-medium">
                              <span>Discount</span>
                              <span>-${currentInvoice.discount_amount || "0.00"}</span>
                            </div>
                          )}
                          <div className="border-t-2 border-[#0EFF7B]/50 pt-3 lg:pt-6 mt-3 lg:mt-6">
                            <div className="flex justify-between text-lg lg:text-xl xl:text-2xl font-bold text-[#0EFF7B]">
                              <span>Grand Total</span>
                              <span>${currentInvoice.grand_total || currentInvoice.net_amount || "0.00"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Payment Status */}
                    <div className="mt-4 lg:mt-10 text-center text-xs lg:text-sm text-gray-600 dark:text-gray-400 space-y-1 lg:space-y-2">
                      <p>
                        Payment Method: <strong className="text-gray-900 dark:text-white">
                          {currentInvoice.payment_method || currentInvoice.payment_mode || "Cash"}
                        </strong>
                      </p>
                      <p>
                        Status: <strong className="text-green-600 text-sm lg:text-base xl:text-lg font-bold">
                          {currentInvoice.status || currentInvoice.payment_status || "Paid"}
                        </strong>
                      </p>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}
       
        {/* === TEST REPORTS TAB === */}
        {activeTab === "Test Reports" && !dataLoading && (
          <div className="rounded-xl p-3 sm:p-4 mb-4 bg-transparent">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 lg:mb-6 gap-4">
              <p className="text-gray-600 dark:text-[#A0A0A0] text-[14px] sm:text-[16px]">
                Patients test report information.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full lg:w-auto">
                <FilterListbox
                  value={selectedMonth}
                  onChange={setSelectedMonth}
                  options={[
                    "All",
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December",
                  ]}
                  label="Month"
                />
                <FilterListbox
                  value={selectedDepartment}
                  onChange={setSelectedDepartment}
                  options={departments}
                  label="Department"
                />
                <FilterListbox
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  options={["All", "Completed", "Pending", "Cancelled"]}
                  label="Status"
                />
              </div>
            </div>
            {filteredTests.length === 0 ? (
              <p className="text-center py-6 text-gray-600 dark:text-gray-400 italic">
                No test reports found
              </p>
            ) : (
              <>
                <ResponsiveTable
                  headers={["Source", "Date & Time", "Month", "Test Type", "Department", "Status", "Report"]}
                  mobileData={currentTests.map(t => [
                    t.source || "Lab",
                    t.dateTime,
                    t.month,
                    t.testType,
                    t.department,
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                        t.status === "Completed"
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : t.status === "Pending"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                      }`}
                    >
                      {t.status}
                    </span>,
                    t.hasReport ? (
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewReportSimple(t.reportId);
                          }}
                          className="p-1 rounded-full border border-[#0EFF7B1A] bg-[#0EFF7B1A] hover:bg-[#0EFF7B33]"
                        >
                          <Eye size={14} className="text-[#08994A] dark:text-[#0EFF7B]" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadReportSimple(t.reportId, t.testType);
                          }}
                          className="p-1 rounded-full border border-[#08994A1A] bg-[#08994A1A] hover:bg-[#0cd96822]"
                        >
                          <Download size={14} className="text-[#08994A] dark:text-[#0EFF7B]" />
                        </button>
                      </div>
                    ) : "No report"
                  ])}
                >
                  <thead>
                    <tr className="text-left text-[14px] sm:text-[16px] text-[#08994A] dark:text-[#0EFF7B] border-b border-gray-300 dark:border-gray-700">
                      <th className="py-3 px-2 sm:px-4">Source</th>
                      <th className="py-3 px-2 sm:px-4">Date & Time</th>
                      <th className="py-3 px-2 sm:px-4">Month</th>
                      <th className="py-3 px-2 sm:px-4">Test Type</th>
                      <th className="py-3 px-2 sm:px-4">Department</th>
                      <th className="py-3 px-2 sm:px-4">Status</th>
                      <th className="py-3 px-2 sm:px-4">Report</th>
                    </tr>
                  </thead>
                  <tbody className="text-[14px] sm:text-[16px] text-black dark:text-white">
                    {currentTests.map((t, i) => (
                      <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="py-3 px-2 sm:px-4">
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                              t.source === "Medicine Allocation"
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                                : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                            }`}
                          >
                            {t.source || "Lab"}
                          </span>
                        </td>
                        <td className="py-3 px-2 sm:px-4">{t.dateTime}</td>
                        <td className="py-3 px-2 sm:px-4">{t.month}</td>
                        <td className="py-3 px-2 sm:px-4">{t.testType}</td>
                        <td className="py-3 px-2 sm:px-4">{t.department}</td>
                        <td className="py-3 px-2 sm:px-4">
                          <span
                            className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                              t.status === "Completed"
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : t.status === "Pending"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 sm:px-4">
                          {t.hasReport ? (
                            <div className="flex items-center gap-2">
                              <div className="relative group">
                                <button
                                  onClick={() => handleViewReportSimple(t.reportId)}
                                  className="flex items-center justify-center w-8 h-8 rounded-full
                                    border border-[#0EFF7B1A] dark:border-[#0EFF7B1A]
                                    bg-[#0EFF7B1A] dark:bg-[#0EFF7B1A] cursor-pointer
                                    hover:bg-[#0EFF7B33] dark:hover:bg-[#0EFF7B33]"
                                >
                                  <Eye
                                    size={18}
                                    className="text-[#08994A] dark:text-[#0EFF7B]
                                      hover:text-[#0cd968] dark:hover:text-[#0cd968]"
                                  />
                                </button>
                                <span
                                  className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap
                                    px-3 py-1 text-xs rounded-md shadow-md
                                    bg-white dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100
                                    transition-all duration-150"
                                >
                                  View Report
                                </span>
                              </div>
                              <div className="relative group">
                                <button
                                  onClick={() => handleDownloadReportSimple(t.reportId, t.testType)}
                                  className="flex items-center justify-center w-8 h-8 rounded-full
                                    border border-[#08994A1A] dark:border-[#0EFF7B1A]
                                    bg-[#08994A1A] dark:bg-[#0EFF7B1A] cursor-pointer
                                    hover:bg-[#0cd96822] dark:hover:bg-[#0cd96822]"
                                >
                                  <Download
                                    size={18}
                                    className="text-[#08994A] dark:text-[#0EFF7B]
                                      hover:text-[#0cd968] dark:hover:text-[#0cd968]"
                                  />
                                </button>
                                <span
                                  className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap
                                    px-3 py-1 text-xs rounded-md shadow-md
                                    bg-white dark:bg-black text-black dark:text-white opacity-0 group-hover:opacity-100
                                    transition-all duration-150"
                                >
                                  Download Report
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400 text-sm">No report</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </ResponsiveTable>
                <div className="flex items-center mt-4 gap-x-4">
                  <div className="text-sm text-black dark:text-white">
                    Page {currentTestPage} of {totalPages(filteredTests)}
                  </div>
                  <div className="flex items-center gap-x-2">
                    <button
                      onClick={() => setCurrentTestPage(Math.max(1, currentTestPage - 1))}
                      disabled={currentTestPage === 1}
                      className="p-1 rounded-full border border-[#0EFF7B] disabled:opacity-50"
                    >
                      <ChevronLeft size={12} />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentTestPage(
                          Math.min(totalPages(filteredTests), currentTestPage + 1)
                        )
                      }
                      disabled={currentTestPage === totalPages(filteredTests)}
                      className="p-1 rounded-full border border-[#0EFF7B] disabled:opacity-50"
                    >
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
       
        {activeTab === "Surgeries" && !dataLoading && (
  <div className="rounded-xl p-3 sm:p-4 mb-4 bg-transparent">
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 lg:mb-6 gap-4">
      <p className="text-gray-600 dark:text-[#A0A0A0] text-[14px] sm:text-[16px]">
        Patient's surgical history and procedures.
      </p>
    </div>
    {surgeries.length === 0 ? (
      <p className="text-center py-6 text-gray-600 dark:text-gray-400 italic">
        No surgery records found
      </p>
    ) : (
      <>
        <ResponsiveTable
          headers={["Date", "Surgery Name", "Doctor", "Status"]}
          mobileData={currentSurgeries.map(s => [
            s.scheduled_date ? formatSurgeryDate(s.scheduled_date) : "—",
            s.surgery_type,
            s.doctor || "—",
            <span
              className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                s.status === "success"
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  : s.status === "pending"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  : s.status === "cancelled"
                  ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
              }`}
            >
              {s.status ? s.status.charAt(0).toUpperCase() + s.status.slice(1) : "—"}
            </span>
          ])}
        >
          <thead>
            <tr className="text-left text-[14px] sm:text-[16px] text-[#08994A] dark:text-[#0EFF7B] border-b border-gray-300 dark:border-gray-700">
              <th className="py-3 px-2 sm:px-4">Date</th>
              <th className="py-3 px-2 sm:px-4">Surgery Name</th>
              <th className="py-3 px-2 sm:px-4">Doctor</th>
              <th className="py-3 px-2 sm:px-4">Status</th>
            </tr>
          </thead>
          <tbody className="text-[14px] sm:text-[16px] text-black dark:text-white">
            {currentSurgeries.map((s, i) => (
              <tr
                key={i}
                className="border-b border-gray-200 dark:border-gray-700"
              >
                <td className="py-3 px-2 sm:px-4">
                  {s.scheduled_date ? formatSurgeryDate(s.scheduled_date) : "—"}
                </td>
                <td className="py-3 px-2 sm:px-4 font-medium">{s.surgery_type || "—"}</td>
                <td className="py-3 px-2 sm:px-4">{s.doctor || "—"}</td>
                <td className="py-3 px-2 sm:px-4">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                      s.status === "success"
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : s.status === "pending"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        : s.status === "cancelled"
                        ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    }`}
                  >
                    {s.status ? s.status.charAt(0).toUpperCase() + s.status.slice(1) : "—"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </ResponsiveTable>
        <div className="flex items-center mt-4 gap-x-4">
          <div className="text-sm text-black dark:text-white">
            Page {currentSurgeryPage} of {totalPages(surgeries)}
          </div>
          <div className="flex items-center gap-x-2">
            <button
              onClick={() => setCurrentSurgeryPage(Math.max(1, currentSurgeryPage - 1))}
              disabled={currentSurgeryPage === 1}
              className="p-1 rounded-full border border-[#0EFF7B] disabled:opacity-50"
            >
              <ChevronLeft size={12} />
            </button>
            <button
              onClick={() =>
                setCurrentSurgeryPage(
                  Math.min(totalPages(surgeries), currentSurgeryPage + 1)
                )
              }
              disabled={currentSurgeryPage === totalPages(surgeries)}
              className="p-1 rounded-full border border-[#0EFF7B] disabled:opacity-50"
            >
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </>
    )}
  </div>
)}
       {/* === HISTORY TAB === */}
        {activeTab === "History" && !dataLoading && (
          <div className="rounded-xl p-3 sm:p-4 mb-4 bg-transparent">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 lg:mb-6 gap-4">
              <p className="text-gray-600 dark:text-[#A0A0A0] text-[14px] sm:text-[16px]">
                Patient's history records showing registration and status changes.
              </p>
            </div>
            {history.length === 0 ? (
              <p className="text-center py-6 text-gray-600 dark:text-gray-400 italic">
                No history records found
              </p>
            ) : (
              <>
                <ResponsiveTable
                  headers={["Doctor", "Department", "Status", "Date & Time"]}
                  mobileData={currentHistory.map((h, idx) => [
                    h.doctor,
                    h.department,
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                        h.status?.toLowerCase() === "active"
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : h.status?.toLowerCase() === "completed" || h.status?.toLowerCase() === "discharged"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                          : h.status?.toLowerCase() === "pending"
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
                      }`}
                    >
                      {h.status}
                    </span>,
                    h.created_at
                  ])}
                >
                  <thead>
                    <tr className="text-left text-[14px] sm:text-[16px] text-[#08994A] dark:text-[#0EFF7B] border-b border-gray-300 dark:border-gray-700">
                      <th className="py-3 px-2 sm:px-4">Doctor</th>
                      <th className="py-3 px-2 sm:px-4">Department</th>
                      <th className="py-3 px-2 sm:px-4">Status</th>
                      <th className="py-3 px-2 sm:px-4">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="text-[14px] sm:text-[16px] text-black dark:text-white">
                    {currentHistory.map((h, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-200 dark:border-gray-700"
                      >
                        <td className="py-3 px-2 sm:px-4">{h.doctor || "—"}</td>
                        <td className="py-3 px-2 sm:px-4">{h.department || "—"}</td>
                        <td className="py-3 px-2 sm:px-4">
                          <span
                            className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                              h.status?.toLowerCase() === "active"
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : h.status?.toLowerCase() === "completed" || h.status?.toLowerCase() === "discharged"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                : h.status?.toLowerCase() === "pending"
                                ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            }`}
                          >
                            {h.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 sm:px-4">{h.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </ResponsiveTable>
                <div className="flex items-center mt-4 gap-x-4">
                  <div className="text-sm text-black dark:text-white">
                    Page {currentHistoryPage} of {totalPages(history)}
                  </div>
                  <div className="flex items-center gap-x-2">
                    <button
                      onClick={() => setCurrentHistoryPage(Math.max(1, currentHistoryPage - 1))}
                      disabled={currentHistoryPage === 1}
                      className="p-1 rounded-full border border-[#0EFF7B] disabled:opacity-50"
                    >
                      <ChevronLeft size={12} />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentHistoryPage(
                          Math.min(totalPages(history), currentHistoryPage + 1)
                        )
                      }
                      disabled={currentHistoryPage === totalPages(history)}
                      className="p-1 rounded-full border border-[#0EFF7B] disabled:opacity-50"
                    >
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}