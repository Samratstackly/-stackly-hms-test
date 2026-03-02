// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Phone, Mail, Edit, ArrowLeft, X ,Users, Activity, Star} from "lucide-react";

// const DoctorProfile = () => {
//   const navigate = useNavigate();
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "Dr. David Miller",
//     gender: "Female",
//     age: "42",
//     bloodGroup: "A+",
//     contact: "+91 62742 xxxx",
//     email: "Davidmiller52@gmail.com",
//     education: "MBBS, FCPS",
//     quote: "Dr. Smith is dedicated to providing compassionate, patient-centered care, focusing on minimally invasive techniques for faster recovery.",
//     experience: "10+ years",
//     department: "Orthopaedics",
//     licenseNumber: "MD-2346-U735",
//     specialization: "Joint Replacement",
//     boardCertifications: "American Board of Orthopedic Surgery",
//     professionalMemberships: "American Medical Association (AMA)",
//     languagesSpoken: "English",
//     awards: "Top Doctor awards, hospital honors",
//   });

//   const handleEditClick = () => {
//     setShowEditModal(true);
//   };

//   const handleCloseModal = () => {
//     setShowEditModal(false);
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log("Updated Profile:", formData);
//     setShowEditModal(false);
//     // In a real app, this would update the backend or state management
//   };

//   return (
//     // <div className="min-h-screen mt-[60px] bg-gray-100 dark:bg-black text-black dark:text-white p-6">
//       <div
//       className="mt-[80px] mb-4 bg-gray-100 dark:bg-black text-black dark:text-white dark:border-[#1E1E1E] rounded-xl p-8 w-full max-w-[1400px] mx-auto flex flex-col bg-gray-100 dark:bg-transparent overflow-hidden relative"
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
//       <div className="mb-6">
//           <button
//             className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-2 rounded-[8px] hover:bg-[#0EFF7B1A] border-b-[2px] border-[#0EFF7B66] dark:border-[#0EFF7B66] dark:hover:bg-green-600 text-white dark:text-white text-sm md:text-base"
//             onClick={() => navigate(-1)}
//             style={{
//               background: "linear-gradient(92.18deg, #025126 3.26%, #0D7F41 50.54%, #025126 97.83%)",
//             }}
//           >
//             <ArrowLeft size={18} /> Back
//           </button>
//         </div>
//       <div className="text-black dark:text-white font-medium text-[20px] mb-4">Doctor/Nurse Profile</div>

//       <div className="grid md:grid-cols-2 gap-6">
//         {/* Left Section */}
// <div className=" bg-gray-100 dark:bg-[#1E1E1E] p-6 rounded-xl border border-[#0EFF7B] dark:border-[#3C3C3C]">
//   {/* Edit Button - inside top right */}
//    <div className="flex justify-end mb-4">
//     <button
//       className="text-[#08994A] dark:text-[#0EFF7B] w-[45px] h-[45px] p-3 rounded-full bg-[#F5F6F5] dark:bg-neutral-800 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B33] flex items-center justify-center"
//       onClick={handleEditClick}
//     >
//       <Edit size={18} />
//     </button>
//   </div>

//           {/* Profile */}
//           <div className="flex items-start gap-7">
//             <div className="min-w-[192px] h-[264px] rounded-lg bg-gray-200 dark:bg-neutral-800"></div>
//             <div className="mt-[100px]">
//               <span className="w-[108px] h-[35px] flex items-center justify-center gap-2 rounded-[30px] border border-[#0EFF7B] dark:border-[#0EFF7B] bg-gray-100 dark:bg-[#1E1E1E] text-[#08994A] dark:text-[#0EFF7B] text-[12px] px-[10px]">
//                 <span className="w-[8px] h-[8px] rounded-full bg-[#08994A] dark:bg-[#0EFF7B]"></span>
//                 Available
//               </span>
//               <h2 className="text-[26px] font-bold mt-2 text-black dark:text-white">{formData.name}</h2>
//               <p className="text-gray-600 dark:text-gray-400">Orthopaedics Surgeon</p>

//               <div className="flex gap-3 mt-3">
//                 <button className="text-[#08994A] dark:text-[#0EFF7B] w-[45px] h-[45px] p-3 rounded-[50px] bg-[#F5F6F5] dark:bg-neutral-800 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B33]">
//                   <Phone size={18} />
//                 </button>
//                 <button className="text-[#08994A] dark:text-[#0EFF7B] w-[45px] h-[45px] p-3 rounded-[50px] bg-[#F5F6F5] dark:bg-neutral-800 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B33]">
//                   <Mail size={18} />
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Basic Info */}
//           <div className="mt-6 text-sm space-y-2">
//             <p>
//               <span className="text-[17px] font-semibold text-black dark:text-white">Basic Information</span>
//             </p>
//             <p><span className="text-gray-600 dark:text-white">Gender:</span> <span className="text-[#08994A] dark:text-[#0EFF7B]">{formData.gender}</span></p>
//             <p><span className="text-gray-600 dark:text-white">Age:</span> <span className="text-[#08994A] dark:text-[#0EFF7B]">{formData.age}</span></p>
//             <p><span className="text-gray-600 dark:text-white">Blood Group:</span> <span className="text-[#08994A] dark:text-[#0EFF7B]">{formData.bloodGroup}</span></p>
//             <p><span className="text-gray-600 dark:text-white">Contact:</span> <span className="text-[#08994A] dark:text-[#0EFF7B]">{formData.contact}</span></p>
//             <p><span className="text-gray-600 dark:text-white">Email:</span> <span className="text-[#08994A] dark:text-[#0EFF7B]">{formData.email}</span></p>
//             <p><span className="text-gray-600 dark:text-white">Education:</span> <span className="text-[#08994A] dark:text-[#0EFF7B]">{formData.education}</span></p>
//             <p className="text-black dark:text-white italic text-sm"><span className="text-[#08994A] dark:text-[#0EFF7B]">{formData.quote}</span></p>
//           </div>

//           {/* About */}
//           <div className="mt-6">
//             <h3 className="font-semibold mb-2 text-black dark:text-white">About the Physician</h3>
//           </div>

//           {/* Details */}
//           <div className="mt-6 text-sm space-y-2">
//             <p><span className="text-gray-600 dark:text-white">Experience:</span> <span className="text-[#08994A] dark:text-[#0EFF7B]">{formData.experience}</span></p>
//             <p><span className="text-gray-600 dark:text-white">Department:</span> <span className="text-[#08994A] dark:text-[#0EFF7B]">{formData.department}</span></p>
//             <p><span className="text-gray-600 dark:text-white">License Number:</span> <span className="text-[#08994A] dark:text-[#0EFF7B]">{formData.licenseNumber}</span></p>
//             <p><span className="text-gray-600 dark:text-white">Specialization:</span> <span className="text-[#08994A] dark:text-[#0EFF7B]">{formData.specialization}</span></p>
//             <p><span className="text-gray-600 dark:text-white">Board Certifications:</span> <span className="text-[#08994A] dark:text-[#0EFF7B]">{formData.boardCertifications}</span></p>
//             <p><span className="text-gray-600 dark:text-white">Professional Memberships:</span> <span className="text-[#08994A] dark:text-[#0EFF7B]">{formData.professionalMemberships}</span></p>
//             <p><span className="text-gray-600 dark:text-white">Languages Spoken:</span> <span className="text-[#08994A] dark:text-[#0EFF7B]">{formData.languagesSpoken}</span></p>
//             <p><span className="text-gray-600 dark:text-white">Awards & Recognitions:</span> <span className="text-[#08994A] dark:text-[#0EFF7B]">{formData.awards}</span></p>
//           </div>
//         </div>

//         {/* Right Section */}
//         <div className="bg-gray-100 dark:bg-[#1E1E1E] p-4 rounded-xl space-y-6 border border-[#0EFF7B] dark:border-[#3C3C3C]">
//           {/* Stats */}
//           <div className="grid grid-cols-3 gap-4">
//   {/* Total Patients */}
//   <div className="bg-[#0EFF7B1A] dark:bg-[#000000] p-5 rounded-lg text-center">
//     <p className="text-black dark:text-white text-[18px]">Total Patients</p>
//     <div className="flex justify-center items-center gap-2">
//       <Users size={26} className="text-[#08994A] dark:text-[#0EFF7B]" />
//       <p className="text-2xl font-medium text-black dark:text-white">230</p>
//     </div>
//     <p className="text-green-500 text-[12px]">
//       +35% <span className="text-black dark:text-white text-[12px]"> Have increased from yesterday</span>
//     </p>
//   </div>

//   {/* Surgeries */}
//   <div className="bg-[#0EFF7B1A] dark:bg-[#000000] p-5 rounded-lg text-center">
//     <p className="text-black dark:text-white text-[18px]">Surgeries</p>
//     <div className="flex justify-center items-center gap-2">
//       <Activity size={26} className="text-[#08994A] dark:text-[#0EFF7B]" />
//       <p className="text-2xl font-medium text-black dark:text-white">90</p>
//     </div>
//     <p className="text-green-500 text-xs">
//       95% <span className="text-black dark:text-white text-[12px]">success rate</span>
//     </p>
//   </div>

//   {/* Reviews */}
//   <div className="bg-[#0EFF7B1A] dark:bg-[#000000] p-5 rounded-lg text-center">
//     <p className="text-black dark:text-white text-[18px]">Reviews</p>
//     <div className="flex justify-center items-center gap-2">
//       <Star size={26} className="text-[#FFD700]" fill="#FFD700" />
//       <p className="text-2xl font-medium text-black dark:text-white">4.5/5.0</p>
//     </div>
//     <p className="text-black dark:text-white text-xs">Based on patient review</p>
//   </div>
// </div>

//           {/* Patient Visits */}
//           <div>
//             <h3 className="font-semibold mb-3 text-black dark:text-white">Patient Visits</h3>
//             <div className="grid sm:grid-cols-2 gap-4">
//               <div className="bg-[#0EFF7B1A] dark:bg-[#000000] p-4 rounded-[12px]">
//                 <p className="font-semibold text-black dark:text-white">Routine Check</p>
//                 <p className="text-blue-400 text-sm">9:00AM - 10:30AM</p>
//                 <p className="text-gray-600 dark:text-gray-400 text-xs italic">Vital signs & basic assessments</p>
//               </div>
//               <div className="bg-[#0EFF7B1A] dark:bg-[#000000] p-4 rounded-[12px]">
//                 <p className="font-semibold text-black dark:text-white">Outpatient Appointments</p>
//                 <p className="text-blue-400 text-sm">10:00AM - 12:00PM</p>
//                 <p className="text-gray-600 dark:text-gray-400 text-xs italic">Consultations & follow-ups with OPD cases</p>
//               </div>
//               <div className="bg-[#0EFF7B1A] dark:bg-[#000000] p-4 rounded-[12px]">
//                 <p className="font-semibold text-black dark:text-white">Minor Procedures</p>
//                 <p className="text-blue-400 text-sm">12:00PM - 1:00PM</p>
//                 <p className="text-gray-600 dark:text-gray-400 text-xs italic">Small treatments, wound checks, post-surgery reviews.</p>
//               </div>
//               <div className="bg-[#0EFF7B1A] dark:bg-[#000000] p-4 rounded-[12px]">
//                 <p className="font-semibold text-black dark:text-white">Lunch & Documentation</p>
//                 <p className="text-blue-400 text-sm">1:00PM - 2:00PM</p>
//                 <p className="text-gray-600 dark:text-gray-400 text-xs italic">Break time & updating patient records</p>
//               </div>
//               <div className="bg-[#0EFF7B1A] dark:bg-[#000000] p-4 rounded-[12px]">
//                 <p className="font-semibold text-black dark:text-white">New Patient Consultations</p>
//                 <p className="text-blue-400 text-sm">2:00PM - 4:00PM</p>
//                 <p className="text-gray-600 dark:text-gray-400 text-xs italic">First-time visits and detailed assessments</p>
//               </div>
//               <div className="bg-[#0EFF7B1A] dark:bg-[#000000] p-4 rounded-[12px]">
//                 <p className="font-semibold text-black dark:text-white">Outpatient & Emergency</p>
//                 <p className="text-blue-400 text-sm">4:00PM - 7:00PM</p>
//                 <p className="text-gray-600 dark:text-gray-400 text-xs italic">Emergency cases & urgent patient care</p>
//               </div>
//             </div>
//           </div>

//           {/* Availability */}
//           <div>
//             <h3 className="font-semibold mb-2 text-black dark:text-white">Availability</h3>
//             <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Only on weekdays (Mon-Fri)</p>
//             <div className="flex gap-4">
//               <span className="px-3 py-1 rounded-md bg-[#F5F6F5] dark:bg-[#0EFF7B1A] border-[2px] border-[#0EFF7B66] text-sm text-black dark:text-white shadow-[0px_0px_4px_0px_#0EFF7B40]">
//                 9:00AM - 12:00PM
//               </span>
//               <span className="px-3 py-1 rounded-md bg-[#F5F6F5] dark:bg-[#0EFF7B1A] border-[2px] border-[#0EFF7B66] text-sm text-black dark:text-white shadow-[0px_0px_4px_0px_#0EFF7B40]" >
//                 4:00PM - 7:00PM
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Edit Modal */}
//       {showEditModal && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
//           <div className="w-[800px] h-[500px] rounded-[20px]  bg-gray-100 dark:bg-black text-black dark:text-white p-6 shadow-[0px_0px_4px_0px_rgba(255,255,255,0.12)] backdrop-blur-md relative flex flex-col">
//             <div
//     style={{
//       position: "absolute",
//       inset: 0,
//       borderRadius: "20px",
//       padding: "2px",
//       background:
//         "linear-gradient(to bottom right, rgba(14,255,123,0.7) 0%, rgba(30,30,30,0.7) 50%, rgba(14,255,123,0.7) 100%)",
//       WebkitMask:
//         "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
//       WebkitMaskComposite: "xor",
//       maskComposite: "exclude",
//       pointerEvents: "none",
//       zIndex: 0,
//     }}
//   ></div>
//             {/* Header */}
//             <div className="flex justify-between items-center pb-3 mb-4">
//               <h3 className="text-lg font-semibold text-black dark:text-white">Edit Profile</h3>
//               <button
//                 onClick={handleCloseModal}
//                 className="w-6 h-6 rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow-[0px_0px_4px_0px_#0EFF7B1A] flex items-center justify-center hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A] hover:text-[#08994A] dark:hover:text-white"
//               >
//                 <X size={16} className="text-[#08994A] dark:text-white" />
//               </button>
//             </div>

//             {/* Form with Scrollable Content */}
//             <div className="flex-1 overflow-y-auto no-scrollbar">
//               <div className="grid grid-cols-3 gap-4 mb-6">
//                 <div>
//                   <label className="text-sm text-black dark:text-white mb-1 block">Name</label>
//                   <input
//                     type="text"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleInputChange}
//                     className="w-full h-[42px] border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[8px] px-[12px] py-[8px] text-sm text-black dark:text-white bg-[#F5F6F5] dark:bg-black"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm text-black dark:text-white mb-1 block">Gender</label>
//                   <input
//                     type="text"
//                     name="gender"
//                     value={formData.gender}
//                     onChange={handleInputChange}
//                     className="w-full h-[42px] border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[8px] px-[12px] py-[8px] text-sm text-black dark:text-white bg-[#F5F6F5] dark:bg-black"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm text-black dark:text-white mb-1 block">Age</label>
//                   <input
//                     type="text"
//                     name="age"
//                     value={formData.age}
//                     onChange={handleInputChange}
//                     className="w-full h-[42px] border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[8px] px-[12px] py-[8px] text-sm text-black dark:text-white bg-[#F5F6F5] dark:bg-black"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm text-black dark:text-white mb-1 block">Blood Group</label>
//                   <input
//                     type="text"
//                     name="bloodGroup"
//                     value={formData.bloodGroup}
//                     onChange={handleInputChange}
//                     className="w-full h-[42px] border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[8px] px-[12px] py-[8px] text-sm text-black dark:text-white bg-[#F5F6F5] dark:bg-black"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm text-black dark:text-white mb-1 block">Contact</label>
//                   <input
//                     type="text"
//                     name="contact"
//                     value={formData.contact}
//                     onChange={handleInputChange}
//                     className="w-full h-[42px] border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[8px] px-[12px] py-[8px] text-sm text-black dark:text-white bg-[#F5F6F5] dark:bg-black"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm text-black dark:text-white mb-1 block">Email</label>
//                   <input
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleInputChange}
//                     className="w-full h-[42px] border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[8px] px-[12px] py-[8px] text-sm text-black dark:text-white bg-[#F5F6F5] dark:bg-black"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm text-black dark:text-white mb-1 block">Education</label>
//                   <input
//                     type="text"
//                     name="education"
//                     value={formData.education}
//                     onChange={handleInputChange}
//                     className="w-full h-[42px] border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[8px] px-[12px] py-[8px] text-sm text-black dark:text-white bg-[#F5F6F5] dark:bg-black"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm text-black dark:text-white mb-1 block">Experience</label>
//                   <input
//                     type="text"
//                     name="experience"
//                     value={formData.experience}
//                     onChange={handleInputChange}
//                     className="w-full h-[42px] border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[8px] px-[12px] py-[8px] text-sm text-black dark:text-white bg-[#F5F6F5] dark:bg-black"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm text-black dark:text-white mb-1 block">Department</label>
//                   <input
//                     type="text"
//                     name="department"
//                     value={formData.department}
//                     onChange={handleInputChange}
//                     className="w-full h-[42px] border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[8px] px-[12px] py-[8px] text-sm text-black dark:text-white bg-[#F5F6F5] dark:bg-black"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm text-black dark:text-white mb-1 block">License Number</label>
//                   <input
//                     type="text"
//                     name="licenseNumber"
//                     value={formData.licenseNumber}
//                     onChange={handleInputChange}
//                     className="w-full h-[42px] border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[8px] px-[12px] py-[8px] text-sm text-black dark:text-white bg-[#F5F6F5] dark:bg-black"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm text-black dark:text-white mb-1 block">Specialization</label>
//                   <input
//                     type="text"
//                     name="specialization"
//                     value={formData.specialization}
//                     onChange={handleInputChange}
//                     className="w-full h-[42px] border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[8px] px-[12px] py-[8px] text-sm text-black dark:text-white bg-[#F5F6F5] dark:bg-black"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm text-black dark:text-white mb-1 block">Board Certifications</label>
//                   <input
//                     type="text"
//                     name="boardCertifications"
//                     value={formData.boardCertifications}
//                     onChange={handleInputChange}
//                     className="w-full h-[42px] border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[8px] px-[12px] py-[8px] text-sm text-black dark:text-white bg-[#F5F6F5] dark:bg-black"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm text-black dark:text-white mb-1 block">Professional Memberships</label>
//                   <input
//                     type="text"
//                     name="professionalMemberships"
//                     value={formData.professionalMemberships}
//                     onChange={handleInputChange}
//                     className="w-full h-[42px] border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[8px] px-[12px] py-[8px] text-sm text-black dark:text-white bg-[#F5F6F5] dark:bg-black"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm text-black dark:text-white mb-1 block">Languages Spoken</label>
//                   <input
//                     type="text"
//                     name="languagesSpoken"
//                     value={formData.languagesSpoken}
//                     onChange={handleInputChange}
//                     className="w-full h-[42px] border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[8px] px-[12px] py-[8px] text-sm text-black dark:text-white bg-[#F5F6F5] dark:bg-black"
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm text-black dark:text-white mb-1 block">Awards & Recognitions</label>
//                   <input
//                     type="text"
//                     name="awards"
//                     value={formData.awards}
//                     onChange={handleInputChange}
//                     className="w-full h-[42px] border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[8px] px-[12px] py-[8px] text-sm text-black dark:text-white bg-[#F5F6F5] dark:bg-black"
//                   />
//                 </div>
//                 <div className="col-span-3">
//                   <label className="text-sm text-black dark:text-white mb-1 block">Quote</label>
//                   <textarea
//                     name="quote"
//                     value={formData.quote}
//                     onChange={handleInputChange}
//                     className="w-full h-[100px] border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[8px] px-[12px] py-[8px] text-sm text-black dark:text-white bg-[#F5F6F5] dark:bg-black"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Buttons */}
//             <div className="flex justify-center gap-6 mt-4">
//               <button
//                 onClick={handleCloseModal}
//                 className="w-[104px] h-[33px] rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent px-3 py-2 flex items-center justify-center gap-2 text-black dark:text-white font-medium text-[14px] leading-[16px] shadow-[0px_2px_12px_0px_rgba(0,0,0,0.25)] hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A] hover:text-[#08994A] dark:hover:text-white"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSubmit}
//                 className="w-[104px] h-[33px] rounded-[8px] px-3 py-2 flex items-center justify-center gap-2 border-b-[2px] border-[#0EFF7B66] dark:border-[#0EFF7B66] text-white font-medium text-[14px] leading-[16px] hover:scale-105 transition"
//               style={{
//     background: "linear-gradient(92.18deg, #025126 3.26%, #0D7F41 50.54%, #025126 97.83%)",
//   }}>
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//       <style>
//   {`
//     .no-scrollbar::-webkit-scrollbar {
//       display: none;
//     }
//     .no-scrollbar {
//       -ms-overflow-style: none;
//       scrollbar-width: none;
//     }
//   `}
// </style>
//     </div>
//   );
// };

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Phone,
  Mail,
  Edit,
  ArrowLeft,
  X,
  Users,
  Activity,
  Star,
  ChevronDown,
  Loader2,
  Eye,
  Download,
  FileText,
} from "lucide-react";
import { Listbox } from "@headlessui/react";
import { successToast, errorToast } from "../../components/Toast";
import api from "../../utils/axiosConfig";

const DoctorProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [certificatesLoading, setCertificatesLoading] = useState(false);
 
  // ADDED: Validation states
  const [errors, setErrors] = useState({});
  const [formatErrors, setFormatErrors] = useState({});
 
  // Form state for editing
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    age: "",
    bloodGroup: "",
    contact: "",
    email: "",
    education: "",
    quote: "",
    experience: "",
    department_id: "",
    department: "",
    licenseNumber: "",
    specialization: "",
    boardCertifications: "",
    professionalMemberships: "",
    languagesSpoken: "",
    awards: "",
    status: "active",
    profilePictureFile: null,
    profilePicturePreview: null,
    aboutPhysician: "",
    shiftTiming: "",
  });
  // ADDED: Levenshtein function from example
  const levenshtein = (a, b) => {
    const matrix = Array.from({ length: b.length + 1 }, (_, i) =>
      Array.from({ length: a.length + 1 }, (_, j) =>
        i === 0 ? j : j === 0 ? i : 0
      )
    );
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        matrix[i][j] =
          b[i - 1] === a[j - 1]
            ? matrix[i - 1][j - 1]
            : Math.min(
                matrix[i - 1][j - 1] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j] + 1
              );
      }
    }
    return matrix[b.length][a.length];
  };
  // ADDED: Email validation from example
  const validateEmailFormat = (value) => {
    const email = value.trim();
    if (!email) return "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address (e.g., user@domain.com)";
    }
    if (email.includes("..") || email.includes(".@") || email.includes("@.")) {
      return "Invalid email format";
    }
    const [localPart, domain] = email.toLowerCase().split("@");
    if (localPart.length < 2) {
      return "Email username is too short";
    }
    if (/(.)\1{5,}/.test(localPart)) {
      return "Email appears to be invalid";
    }
    if (/(\.\.|__|--|\+\+)/.test(localPart)) {
      return "Email contains invalid characters";
    }
    const invalidDomains = [
      "email.com",
      "example.com",
      "test.com",
      "domain.com",
      "mailinator.com",
      "tempmail.com",
      "guerrillamail.com",
      "10minutemail.com",
      "yopmail.com",
      "fakeemail.com",
      "temp-mail.org",
      "throwawayemail.com",
      "dispostable.com",
      "maildrop.cc"
    ];
    if (invalidDomains.includes(domain)) {
      return "Disposable or invalid email domains are not allowed";
    }
    const providers = [
      "gmail.com",
      "yahoo.com",
      "outlook.com",
      "hotmail.com",
      "icloud.com"
    ];
    for (const provider of providers) {
      const distance = levenshtein(domain, provider);
      if (distance > 0 && distance <= 2) {
        return `Did you mean ${localPart}@${provider}?`;
      }
    }
    const tld = domain.split(".").pop();
    if (tld.length < 2) {
      return "Please use a valid domain extension";
    }
    return "";
  };
  // ADDED: Field format validation
  const validateFieldFormat = (field, value) => {
    switch (field) {
      case "name":
        if (!value) return "";
        if (!/^[A-Za-z\s]*$/.test(value)) {
          return "Name can only contain letters and spaces";
        }
        return "";
     
      case "contact":
        if (!value) return "";
        if (!/^\d*$/.test(value)) {
          return "Phone must contain only digits";
        }
        if (value.length > 10) {
          return "Phone cannot exceed 10 digits";
        }
        if (value.length > 0 && value.length < 10) {
          return "Phone must be exactly 10 digits";
        }
        return "";
     
      case "email":
        return validateEmailFormat(value);
     
      case "age":
        if (!value) return "";
        if (!/^\d*$/.test(value)) {
          return "Age must contain only numbers";
        }
        const ageNum = parseInt(value);
        if (ageNum < 18 || ageNum > 100) {
          return "Age must be between 18 and 100";
        }
        return "";
     
      default:
        return "";
    }
  };
  // ADDED: Get field error
  const getFieldError = (field) => {
    if (formatErrors[field]) {
      return formatErrors[field];
    }
    return errors[field] || "";
  };
  // ADDED: Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (!/^[A-Za-z\s]+$/.test(formData.name)) {
      newErrors.name = "Name can only contain letters and spaces";
    }
    if (!formData.contact.trim()) {
      newErrors.contact = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.contact)) {
      newErrors.contact = "Phone must be exactly 10 digits";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else {
      const emailError = validateEmailFormat(formData.email);
      if (emailError) {
        newErrors.email = emailError;
      }
    }
    if (!formData.age.trim()) {
      newErrors.age = "Age is required";
    } else {
      const ageNum = parseInt(formData.age);
      if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
        newErrors.age = "Age must be between 18 and 100";
      }
    }
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // ADDED: Name change handler
  const handleFullNameChange = (e) => {
    let value = e.target.value;
   
    if (value) {
      value = value.replace(/\b\w/g, char => char.toUpperCase());
    }
   
    setFormData(prev => ({ ...prev, name: value }));
   
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: "" }));
    }
   
    const formatError = validateFieldFormat("name", value);
    if (formatError) {
      setFormatErrors(prev => ({ ...prev, name: formatError }));
    } else {
      setFormatErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.name;
        return newErrors;
      });
    }
  };
  // ADDED: Phone change handler
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setFormData(prev => ({ ...prev, contact: value }));
     
      if (errors.contact) {
        setErrors(prev => ({ ...prev, contact: "" }));
      }
     
      const formatError = validateFieldFormat("contact", value);
      if (formatError) {
        setFormatErrors(prev => ({ ...prev, contact: formatError }));
      } else {
        setFormatErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.contact;
          return newErrors;
        });
      }
    }
  };
  // ADDED: Email change handler
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, email: value }));
   
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: "" }));
    }
   
    const formatError = validateFieldFormat("email", value);
    if (formatError) {
      setFormatErrors(prev => ({ ...prev, email: formatError }));
    } else {
      setFormatErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
  };
  // ADDED: Age change handler
  const handleAgeChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setFormData(prev => ({ ...prev, age: value }));
     
      if (errors.age) {
        setErrors(prev => ({ ...prev, age: "" }));
      }
     
      const formatError = validateFieldFormat("age", value);
      if (formatError) {
        setFormatErrors(prev => ({ ...prev, age: formatError }));
      } else {
        setFormatErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.age;
          return newErrors;
        });
      }
    }
  };
  // ADDED: Blur handler
  const handleBlur = (field) => {
    const value = formData[field];
    const formatError = validateFieldFormat(field, value);
   
    if (formatError) {
      setFormatErrors(prev => ({ ...prev, [field]: formatError }));
    }
  };
  // Parse certificates from comma-separated string
  // Parse certificates from comma-separated string with proper file names
const parseCertificates = (certificatesString) => {
  if (!certificatesString || certificatesString.trim() === '') {
    return [];
  }
  
  const certificatePaths = certificatesString.split(',').map(path => path.trim());
  
  return certificatePaths.map((path, index) => {
    // Extract the original file name from the path
    const fullPath = path;
    const fileName = path.split('/').pop();
    
    // Try to get the original file name (it might be in the path structure)
    // Sometimes the path is like: certificates/doctor_id/OriginalFileName_timestamp.ext
    let displayName = fileName;
    
    // If the file name has timestamp pattern, try to extract original name
    // Common patterns: "MBBS_Certificate_1234567890.pdf" -> "MBBS_Certificate.pdf"
    if (fileName.includes('_')) {
      const parts = fileName.split('_');
      // Check if last part is timestamp (all digits before extension)
      const lastPart = parts[parts.length - 1];
      const hasTimestamp = /^\d+\..+$/.test(lastPart) || /^\d+$/.test(lastPart.split('.')[0]);
      
      if (hasTimestamp) {
        // Remove the timestamp part
        parts.pop();
        displayName = parts.join('_');
      }
    }
    
    return {
      id: index + 1,
      name: displayName,
      originalPath: path,
      fullPath: path,
      displayName: displayName,
      originalName: fileName
    };
  });
};
 
  const handleViewCertificate = (certificate) => {
    const filePath = certificate.originalPath;
    const fileUrl = `${import.meta.env.VITE_API_BASE_URL}/${filePath}`;
    console.log("Viewing certificate URL:", fileUrl);
    window.open(fileUrl, "_blank");
  };
  // Handle download certificate
// FIXED: Force download with multiple fallback methods
const handleDownloadCertificate = async (certificate) => {
  try {
    // Show loading toast
    successToast("Preparing download...");
    
    const filePath = certificate.fullPath || certificate.originalPath || certificate.path;
    
    // Handle both string paths and object paths
    let finalPath = '';
    if (typeof filePath === 'string') {
      finalPath = filePath;
    } else if (filePath?.path) {
      finalPath = filePath.path;
    }
    
    // Clean up the path - remove any leading slashes
    finalPath = finalPath.replace(/^\/+/, '');
    
    // Get the file name
    let fileName = certificate.displayName || certificate.name || certificate.originalName || 'certificate';
    
    // Ensure file has extension
    if (!fileName.includes('.')) {
      // Try to determine extension from path
      const pathParts = finalPath.split('.');
      if (pathParts.length > 1) {
        const ext = pathParts.pop();
        fileName += `.${ext}`;
      } else {
        fileName += '.pdf'; // Default to PDF
      }
    }
    
    console.log("Downloading:", { finalPath, fileName });
    
    // METHOD 1: Using fetch with blob (most reliable)
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/${finalPath}`, {
        headers,
        credentials: 'include'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        
        // Create blob URL
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Create download link
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        link.style.display = 'none';
        
        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
        }, 100);
        
        successToast("Download started");
        return;
      }
    } catch (fetchError) {
      console.log("Fetch method failed, trying next method...", fetchError);
    }
    
    // METHOD 2: Using axios or api instance
    try {
      const response = await api.get(`/${finalPath}`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/octet-stream'
        }
      });
      
      const blob = new Blob([response.data]);
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
      
      successToast("Download started");
      return;
    } catch (axiosError) {
      console.log("Axios method failed, trying next method...", axiosError);
    }
    
    // METHOD 3: Using iframe (fallback for PDFs)
    try {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      const downloadUrl = `${import.meta.env.VITE_API_BASE_URL}/${finalPath}?download=true&t=${Date.now()}`;
      
      iframe.src = downloadUrl;
      
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
      
      successToast("Download started");
      return;
    } catch (iframeError) {
      console.log("Iframe method failed", iframeError);
    }
    
    // METHOD 4: Direct link with download attribute (last resort)
    const directUrl = `${import.meta.env.VITE_API_BASE_URL}/${finalPath}`;
    const link = document.createElement('a');
    link.href = directUrl;
    link.download = fileName;
    link.target = '_blank'; // This might cause preview, but it's last resort
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
    
  } catch (error) {
    console.error("All download methods failed:", error);
    errorToast("Failed to download. Please try right-click and 'Save link as...'");
    
    // Final fallback: Open in new tab and let user save manually
    const filePath = certificate.fullPath || certificate.originalPath || certificate.path;
    let finalPath = typeof filePath === 'string' ? filePath : filePath?.path || '';
    finalPath = finalPath.replace(/^\/+/, '');
    const fileUrl = `${import.meta.env.VITE_API_BASE_URL}/${finalPath}`;
    
    window.open(fileUrl, '_blank');
    errorToast("File opened in new tab. Please use right-click → Save as...");
  }
};
 
  // UPDATED: Dropdown component with error support
  const Dropdown = ({
    label,
    value,
    onChange,
    options,
    disabled = false,
    placeholder = "Select",
    fullWidth = false,
    loading = false,
    error = "",
    required = false
  }) => {
    const selectedOption = options.find(
      (opt) => String(opt.id) === String(value)
    );
    const displayValue = selectedOption?.name || placeholder;
    return (
      <div>
        <label className="text-sm text-black dark:text-white block mb-1">
          {label}
        </label>
        <Listbox
          value={value}
          onChange={onChange}
          disabled={disabled || loading}
        >
          <div className="relative">
            <Listbox.Button
              className={`${
                fullWidth ? "w-full" : "w-full"
              } h-[42px] px-3 pr-8 rounded-[8px] border flex items-center ${
                disabled || loading
                  ? "border-gray-300 bg-gray-100 cursor-not-allowed opacity-50"
                  : error
                  ? "border-red-500 bg-gray-100 dark:bg-transparent"
                  : "border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent"
              } text-black dark:text-[#0EFF7B] text-left text-[14px] leading-[16px] truncate`}
            >
              {loading ? (
                <span className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading...
                </span>
              ) : (
                displayValue
              )}
              <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <ChevronDown className="h-4 w-4 text-[#0EFF7B]" />
              </span>
            </Listbox.Button>
            {!loading && !disabled && (
              <Listbox.Options className="absolute z-[100] mt-1 w-full min-w-[160px] rounded-[12px] bg-gray-100 dark:bg-black shadow-lg border border-gray-300 dark:border-[#3A3A3A] max-h-60 overflow-auto">
                {options.length === 0 ? (
                  <div className="py-2 px-3 text-sm text-gray-500">
                    No options available
                  </div>
                ) : (
                  options.map((option) => (
                    <Listbox.Option
                      key={option.id}
                      value={option.id}
                      className={({ active }) =>
                        `cursor-pointer select-none py-2 px-3 text-sm ${
                          active
                            ? "bg-[#0EFF7B33] text-[#0EFF7B]"
                            : "text-black dark:text-white"
                        }`
                      }
                    >
                      {option.name}
                    </Listbox.Option>
                  ))
                )}
              </Listbox.Options>
            )}
          </div>
        </Listbox>
        {error && (
          <p className="text-red-700 dark:text-red-500 text-xs mt-1 font-medium">
            {error}
          </p>
        )}
      </div>
    );
  };
 
  const getFileNameFromPath = (path) => {
    if (!path) return '';
    return path.split('/').pop();
  };
  const fetchDepartments = async () => {
    setDepartmentsLoading(true);
    try {
      const response = await api.get("/patients/departments");
      const data = response.data;
      const formattedDepartments = Array.isArray(data.departments)
        ? data.departments.map((dept) => ({
            id: dept.id || dept.department_id || dept.value,
            name:
              dept.name ||
              dept.department_name ||
              dept.label ||
              "Unnamed Department",
          }))
        : [];
      setDepartments(formattedDepartments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      errorToast("Failed to load departments");
      setDepartments([]);
    } finally {
      setDepartmentsLoading(false);
    }
  };
 
// Move the fetchProfileData function definition outside useEffect
const fetchProfileData = async () => {
  try {
    setLoading(true);
    const profileId = location.state?.profile?.id || profileData?.id;

    if (!profileId) {
      errorToast("No profile ID provided");
      navigate(-1);
      return;
    }

    const response = await api.get(`/staff/${profileId}/`);
    const data = response.data;
    setProfileData(data);

    if (data.certificates) {
      const parsedCertificates = parseCertificates(data.certificates);
      setCertificates(parsedCertificates);
    } else {
      setCertificates([]);
    }

    // Update formData with fresh data
    const departmentName = data.department || "";

    setFormData({
      name: data.full_name || "",
      gender: data.gender || "",
      age: data.age ? String(data.age) : "",
      bloodGroup: formData.bloodGroup || "A+",
      contact: data.phone || "",
      email: data.email || "",
      education: data.education || data.specialization || "",
      quote: data.about_physician || "Dedicated to providing compassionate, patient-centered care.",
      experience: data.experience || "10+ years",
      department_id: data.department_id || "",
      department: departmentName,
      licenseNumber: data.license_number || data.national_id || "",
      specialization: data.specialization || "",
      boardCertifications: data.board_certifications || "American Board of Orthopedic Surgery",
      professionalMemberships: data.professional_memberships || "American Medical Association (AMA)",
      languagesSpoken: data.languages_spoken || "English",
      awards: data.awards_recognitions || "Top Doctor awards, hospital honors",
      status: data.status?.toLowerCase() || "active",
      profilePictureFile: null,
      profilePicturePreview: null,
      aboutPhysician: data.about_physician || "",
      shiftTiming: data.shift_timing || "",
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    errorToast("Failed to load profile data");
    navigate(-1);
  } finally {
    setLoading(false);
  }
};

// Then update your useEffect to use it:
useEffect(() => {
  fetchDepartments();
  fetchProfileData();
}, [location, navigate]);
 
  // UPDATED: handleEditClick
  const handleEditClick = () => {
    setErrors({});
    setFormatErrors({});
    setShowEditModal(true);
  };
 
  const getProfilePictureUrl = (profilePicturePath) => {
    if (!profilePicturePath) return null;
    if (profilePicturePath.startsWith("http")) return profilePicturePath;
    const filename = profilePicturePath.split("/").pop();
    return filename ? `${import.meta.env.VITE_API_BASE_URL}/static/staffs_pictures/${filename}` : null;
  };
 
  // UPDATED: handleCloseModal
  // UPDATED: handleCloseModal
const handleCloseModal = () => {
  setShowEditModal(false);
  setErrors({});
  setFormatErrors({});
  
  // Reset formData to current profileData values
  if (profileData) {
    setFormData({
      name: profileData.full_name || "",
      gender: profileData.gender || "",
      age: profileData.age ? String(profileData.age) : "",
      bloodGroup: formData.bloodGroup || "A+", // Keep existing or default
      contact: profileData.phone || "",
      email: profileData.email || "",
      education: profileData.education || "",
      quote: profileData.about_physician || "Dedicated to providing compassionate, patient-centered care.",
      experience: profileData.experience || "",
      department_id: profileData.department_id || "",
      department: profileData.department || "",
      licenseNumber: profileData.license_number || profileData.national_id || "",
      specialization: profileData.specialization || "",
      boardCertifications: profileData.board_certifications || "",
      professionalMemberships: profileData.professional_memberships || "",
      languagesSpoken: profileData.languages_spoken || "",
      awards: profileData.awards_recognitions || "",
      status: profileData.status || "active",
      profilePictureFile: null,
      profilePicturePreview: null,
      aboutPhysician: profileData.about_physician || "",
      shiftTiming: profileData.shift_timing || "",
    });
  }
};
 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
   
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };
 
  // UPDATED: handleDepartmentChange
  const handleDepartmentChange = (deptId) => {
    const selectedDept = departments.find(
      (dept) => String(dept.id) === String(deptId)
    );
    setFormData((prev) => ({
      ...prev,
      department_id: deptId,
      department: selectedDept?.name || "",
    }));
   
    if (errors.department_id) {
      setErrors(prev => ({ ...prev, department_id: "" }));
    }
  };
 
  const refreshPatientCount = async () => {
    try {
      if (!profileData?.id) return;
      const response = await api.post(`/staff/${profileData.id}/update-statistics/`);
      if (response.status.toString().startsWith('2')) {
        console.log("Statistics updated:", response.data);
        const profileResponse = await api.get(`/staff/${profileData.id}/`);
        if (profileResponse.status.toString().startsWith('2')) {
          setProfileData(profileResponse.data);
          successToast("Patient count updated successfully");
        }
      } else {
        throw new Error("Failed to update statistics");
      }
    } catch (error) {
      console.error("Error refreshing patient count:", error);
      errorToast("Failed to update patient count");
    }
  };
 
  // UPDATED: handleSubmit with validation
  // UPDATED: handleSubmit with validation and proper state update
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    errorToast("Please fix the errors in the form");
    return;
  }

  try {
    if (!profileData?.id) {
      errorToast("No profile ID available for update");
      return;
    }

    const updateData = new FormData();
    
    // Map formData to match backend field names
    updateData.append("full_name", formData.name.trim());
    updateData.append("gender", formData.gender);
    updateData.append("age", parseInt(formData.age) || 0);
    updateData.append("phone", formData.contact);
    updateData.append("email", formData.email.trim());
    updateData.append("specialization", formData.specialization || "");
    updateData.append("national_id", formData.licenseNumber || "");
    updateData.append("status", formData.status.toLowerCase());
    
    // Make sure department_id is included
    if (formData.department_id) {
      updateData.append("department_id", formData.department_id);
    } else if (profileData.department_id) {
      updateData.append("department_id", profileData.department_id);
    }
    
    updateData.append("education", formData.education || "");
    updateData.append("about_physician", formData.aboutPhysician || "");
    updateData.append("experience", formData.experience || "");
    updateData.append("license_number", formData.licenseNumber || "");
    updateData.append("board_certifications", formData.boardCertifications || "");
    updateData.append("professional_memberships", formData.professionalMemberships || "");
    updateData.append("languages_spoken", formData.languagesSpoken || "");
    updateData.append("awards_recognitions", formData.awards || "");
    updateData.append("shift_timing", formData.shiftTiming || "");
    
    if (formData.profilePictureFile) {
      updateData.append("profile_picture", formData.profilePictureFile);
    }

    console.log("Updating staff with data:", {
      id: profileData.id,
      full_name: formData.name,
      department_id: formData.department_id
    });

    // Add proper headers for FormData
    const response = await api.put(`/staff/update/${profileData.id}/`, updateData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.status >= 200 && response.status < 300) {
      const updatedData = response.data;
      console.log("Update successful:", updatedData);

      // Update profileData with the response
      setProfileData(prev => ({
        ...prev,
        ...updatedData,
        full_name: updatedData.full_name || formData.name.trim(),
        department: updatedData.department || formData.department,
        department_id: updatedData.department_id || formData.department_id
      }));

      successToast("Profile updated successfully");
      setShowEditModal(false);
      setErrors({});
      setFormatErrors({});

      // Optionally refresh the data
      setTimeout(() => {
        fetchProfileData(); // You'll need to extract this function
      }, 1000);

    } else {
      throw new Error(`Failed to update: ${response.status}`);
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    if (error.response) {
      console.error("Error details:", error.response.data);
      errorToast(error.response.data?.detail || error.response.data?.message || "Failed to update profile");
    } else {
      errorToast(error.message || "Failed to update profile");
    }
  }
};
  if (loading) {
    return (
      <div className="min-h-screen mt-[80px] flex items-center justify-center bg-gray-100 dark:bg-black">
        <div className="w-8 h-8 border-2 border-[#0EFF7B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
 
  if (!profileData) {
    return (
      <div className="min-h-screen mt-[80px] flex items-center justify-center bg-gray-100 dark:bg-black">
        <div className="text-center">
          <p className="text-black dark:text-white mb-4">Profile not found</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-[#08994A] text-white rounded-lg hover:bg-[#0D7F41]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
 
  const normalizedStatus = profileData.status?.toLowerCase() || "active";
  const statusOptions = [
    { id: "active", name: "Available" },
    { id: "unavailable", name: "Unavailable" },
    { id: "on_leave", name: "On Leave" },
  ];
  const bloodGroupOptions = [
    { id: "A+", name: "A+" },
    { id: "A-", name: "A-" },
    { id: "B+", name: "B+" },
    { id: "B-", name: "B-" },
    { id: "AB+", name: "AB+" },
    { id: "AB-", name: "AB-" },
    { id: "O+", name: "O+" },
    { id: "O-", name: "O-" },
  ];
  const genderOptions = [
    { id: "Male", name: "Male" },
    { id: "Female", name: "Female" },
    { id: "Other", name: "Other" },
  ];
 
  return (
    <div className="mb-4 bg-gray-100 dark:bg-black text-black dark:text-white dark:border-[#1E1E1E] rounded-xl p-8 w-full max-w-[2500px] mx-auto flex flex-col bg-gray-100 dark:bg-transparent overflow-hidden relative font-[Helvetica]">
      {/* YOUR ORIGINAL JSX STARTS HERE - I'M NOT MODIFYING IT */}
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
      <div className="mb-6">
        <button
          className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-2 rounded-[8px] hover:bg-[#0EFF7B1A] border-b-[2px] border-[#0EFF7B66] dark:border-[#0EFF7B66] dark:hover:bg-green-600 text-white dark:text-white text-sm md:text-base"
          onClick={() => navigate(-1)}
          style={{
            background:
              "linear-gradient(92.18deg, #025126 3.26%, #0D7F41 50.54%, #025126 97.83%)",
          }}
        >
          <ArrowLeft size={18} /> Back
        </button>
      </div>
      <div className="text-black dark:text-white font-medium text-[20px] mb-4">
        {profileData.designation === "doctor"
          ? "Doctor"
          : profileData.designation === "nurse"
          ? "Nurse"
          : "Staff"}{" "}
        Profile
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Section */}
        <div className="bg-gray-100 dark:bg-[#1E1E1E] p-6 rounded-xl border border-[#0EFF7B] dark:border-[#3C3C3C]">
          <div className="flex justify-end mb-4 gap-2">
            <button
              className="text-[#08994A] dark:text-[#0EFF7B] w-[45px] h-[45px] p-3 rounded-full bg-[#F5F6F5] dark:bg-neutral-800 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B33] flex items-center justify-center"
              onClick={refreshPatientCount}
              title="Refresh Patient Count"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M23 4v6h-6" />
                <path d="M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </button>
            <button
              className="text-[#08994A] dark:text-[#0EFF7B] w-[45px] h-[45px] p-3 rounded-full bg-[#F5F6F5] dark:bg-neutral-800 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B33] flex items-center justify-center"
              onClick={handleEditClick}
            >
              <Edit size={18} />
            </button>
          </div>
          <div className="flex items-start gap-7">
            <div className="min-w-[192px] h-[264px] rounded-lg bg-gray-200 dark:bg-neutral-800 flex items-center justify-center">
              {profileData.profile_picture ? (
                <img
                  src={getProfilePictureUrl(profileData.profile_picture)}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling &&
                      (e.target.nextSibling.style.display = "block");
                  }}
                />
              ) : (
                <span className="text-gray-400">No Image</span>
              )}
              {profileData.profile_picture && (
                <span className="hidden text-gray-400">No Image</span>
              )}
            </div>
            <div className="mt-[100px]">
              {/* Status Badge */}
              <span
                className={`w-[108px] h-[35px] flex items-center justify-center gap-2 rounded-[30px] border text-[12px] px-[10px] ${
                  normalizedStatus === "active" || normalizedStatus === "available"
                    ? "border-[#0EFF7B] bg-[#0EFF7B1A] text-[#08994A] dark:border-[#0EFF7B] dark:bg-[#0EFF7B1A] dark:text-[#0EFF7B]"
                    : normalizedStatus === "unavailable"
                    ? "border-[#FF6B6B] bg-[#FF6B6B1A] text-[#DC2626] dark:border-[#FF6B6B] dark:bg-[#FF6B6B1A] dark:text-[#FF6B6B]"
                    : "border-[#FBBF24] bg-[#FBBF241A] text-[#D97706] dark:border-[#FBBF24] dark:bg-[#FBBF241A] dark:text-[#FBBF24]"
                }`}
              >
                <span
                  className={`w-[8px] h-[8px] rounded-full ${
                    normalizedStatus === "active" || normalizedStatus === "available"
                      ? "bg-[#08994A] dark:bg-[#0EFF7B]"
                      : normalizedStatus === "unavailable"
                      ? "bg-[#DC2626] dark:bg-[#FF6B6B]"
                      : "bg-[#D97706] dark:bg-[#FBBF24]"
                  }`}
                ></span>
                {normalizedStatus === "active" || normalizedStatus === "available"
                  ? "Available"
                  : normalizedStatus === "unavailable"
                  ? "Unavailable"
                  : "On Leave"}
              </span>
              {/* Name & Specialization */}
              <h2 className="text-[26px] font-bold mt-2 text-black dark:text-white">
                {profileData.full_name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {profileData.specialization || profileData.designation}
              </p>
              <div className="flex gap-3 mt-3">
                <button className="text-[#08994A] dark:text-[#0EFF7B] w-[45px] h-[45px] p-3 rounded-[50px] bg-[#F5F6F5] dark:bg-neutral-800 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B33]">
                  <Phone size={18} />
                </button>
                <button className="text-[#08994A] dark:text-[#0EFF7B] w-[45px] h-[45px] p-3 rounded-[50px] bg-[#F5F6F5] dark:bg-neutral-800 hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B33]">
                  <Mail size={18} />
                </button>
              </div>
            </div>
          </div>
          {/* Basic Info - Updated with dynamic fields */}
          <div className="mt-6 text-sm space-y-2">
            <p>
              <span className="text-[17px] font-semibold text-black dark:text-white">
                Basic Information
              </span>
            </p>
            <p>
              <span className="text-gray-600 dark:text-white">Gender:</span>{" "}
              <span className="text-[#08994A] dark:text-[#0EFF7B]">
                {profileData.gender || "Not specified"}
              </span>
            </p>
            <p>
              <span className="text-gray-600 dark:text-white">Age:</span>{" "}
              <span className="text-[#08994A] dark:text-[#0EFF7B]">
                {profileData.age || "Not specified"}
              </span>
            </p>
            <p>
              <span className="text-gray-600 dark:text-white">
                Blood Group:
              </span>{" "}
              <span className="text-[#08994A] dark:text-[#0EFF7B]">
                {formData.bloodGroup}
              </span>
            </p>
            <p>
              <span className="text-gray-600 dark:text-white">Contact:</span>{" "}
              <span className="text-[#08994A] dark:text-[#0EFF7B]">
                {profileData.phone}
              </span>
            </p>
            <p>
              <span className="text-gray-600 dark:text-white">Email:</span>{" "}
              <span className="text-[#08994A] dark:text-[#0EFF7B]">
                {profileData.email}
              </span>
            </p>
            <p>
              <span className="text-gray-600 dark:text-white">Education:</span>{" "}
              <span className="text-[#08994A] dark:text-[#0EFF7B]">
                {profileData.education || profileData.specialization || "N/A"}
              </span>
            </p>
            <p className="text-black dark:text-white italic text-sm">
              <span className="text-[#08994A] dark:text-[#0EFF7B]">
                {profileData.about_physician || formData.quote}
              </span>
            </p>
          </div>
          <div className="mt-6">
            <h3 className="font-semibold mb-2 text-black dark:text-white">
              About the Physician
            </h3>
          </div>
          {/* Professional Information - Updated with dynamic fields */}
          <div className="mt-6 text-sm space-y-2">
            <p>
              <span className="text-gray-600 dark:text-white">Experience:</span>{" "}
              <span className="text-[#08994A] dark:text-[#0EFF7B]">
                {profileData.experience || formData.experience}
              </span>
            </p>
            <p>
              <span className="text-gray-600 dark:text-white">Department:</span>{" "}
              <span className="text-[#08994A] dark:text-[#0EFF7B]">
                {profileData.department}
              </span>
            </p>
            <p>
              <span className="text-gray-600 dark:text-white">
                License Number:
              </span>{" "}
              <span className="text-[#08994A] dark:text-[#0EFF7B]">
                {profileData.license_number || profileData.national_id || "N/A"}
              </span>
            </p>
            <p>
              <span className="text-gray-600 dark:text-white">
                Specialization:
              </span>{" "}
              <span className="text-[#08994A] dark:text-[#0EFF7B]">
                {profileData.specialization}
              </span>
            </p>
            <p>
              <span className="text-gray-600 dark:text-white">
                Board Certifications:
              </span>{" "}
              <span className="text-[#08994A] dark:text-[#0EFF7B]">
                {profileData.board_certifications ||
                  formData.boardCertifications}
              </span>
            </p>
            <p>
              <span className="text-gray-600 dark:text-white">
                Professional Memberships:
              </span>{" "}
              <span className="text-[#08994A] dark:text-[#0EFF7B]">
                {profileData.professional_memberships ||
                  formData.professionalMemberships}
              </span>
            </p>
            <p>
              <span className="text-gray-600 dark:text-white">
                Languages Spoken:
              </span>{" "}
              <span className="text-[#08994A] dark:text-[#0EFF7B]">
                {profileData.languages_spoken || formData.languagesSpoken}
              </span>
            </p>
            <p>
              <span className="text-gray-600 dark:text-white">
                Awards & Recognitions:
              </span>{" "}
              <span className="text-[#08994A] dark:text-[#0EFF7B]">
                {profileData.awards_recognitions || formData.awards}
              </span>
            </p>
          </div>
        </div>
        {/* Right Section */}
        <div className="bg-gray-100 dark:bg-[#1E1E1E] p-4 rounded-xl space-y-6 border border-[#0EFF7B] dark:border-[#3C3C3C]">
          {/* Stats - Updated with dynamic total_patients_treated */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#0EFF7B1A] dark:bg-[#000000] p-5 rounded-lg text-center">
              <p className="text-black dark:text-white text-[18px]">
                Total Patients
              </p>
              <div className="flex justify-center items-center gap-2">
                <Users
                  size={26}
                  className="text-[#08994A] dark:text-[#0EFF7B]"
                />
                <p className="text-2xl font-medium text-black dark:text-white">
                  {profileData.total_patients_treated || 0}
                </p>
              </div>
              <p className="text-green-500 text-[12px]">
                +35%{" "}
                <span className="text-black dark:text-white text-[12px]">
                  {" "}
                  Have increased from yesterday
                </span>
              </p>
            </div>
            {/* Surgeries */}
<div className="bg-[#0EFF7B1A] dark:bg-[#000000] p-5 rounded-lg text-center">
  <p className="text-black dark:text-white text-[18px]">
    Surgeries
  </p>
  <div className="flex justify-center items-center gap-2">
    <Activity
      size={26}
      className="text-[#08994A] dark:text-[#0EFF7B]"
    />
    <p className="text-2xl font-medium text-black dark:text-white">
      {profileData.total_surgeries || 0}
    </p>
  </div>
  <p className="text-green-500 text-xs">
    {profileData.success_rate || 0}%{" "}
    <span className="text-black dark:text-white text-[12px]">
      success rate
    </span>
  </p>
</div>
            <div className="bg-[#0EFF7B1A] dark:bg-[#000000] p-5 rounded-lg text-center">
              <p className="text-black dark:text-white text-[18px]">Reviews</p>
              <div className="flex justify-center items-center gap-2">
                <Star size={26} className="text-[#FFD700]" fill="#FFD700" />
                <p className="text-2xl font-medium text-black dark:text-white">
                  4.5/5.0
                </p>
              </div>
              <p className="text-black dark:text-white text-xs">
                Based on patient review
              </p>
            </div>
          </div>
          {/* Patient Visits */}
          <div>
            <h3 className="font-semibold mb-3 text-black dark:text-white">
              Patient Visits
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-[#0EFF7B1A] dark:bg-[#000000] p-4 rounded-[12px]">
                <p className="font-semibold text-black dark:text-white">
                  Routine Check
                </p>
                <p className="text-blue-400 text-sm">9:00AM - 10:30AM</p>
                <p className="text-gray-600 dark:text-gray-400 text-xs italic">
                  Vital signs & basic assessments
                </p>
              </div>
              <div className="bg-[#0EFF7B1A] dark:bg-[#000000] p-4 rounded-[12px]">
                <p className="font-semibold text-black dark:text-white">
                  Outpatient Appointments
                </p>
                <p className="text-blue-400 text-sm">10:00AM - 12:00PM</p>
                <p className="text-gray-600 dark:text-gray-400 text-xs italic">
                  Consultations & follow-ups with OPD cases
                </p>
              </div>
              <div className="bg-[#0EFF7B1A] dark:bg-[#000000] p-4 rounded-[12px]">
                <p className="font-semibold text-black dark:text-white">
                  Minor Procedures
                </p>
                <p className="text-blue-400 text-sm">12:00PM - 1:00PM</p>
                <p className="text-gray-600 dark:text-gray-400 text-xs italic">
                  Small treatments, wound checks, post-surgery reviews.
                </p>
              </div>
              <div className="bg-[#0EFF7B1A] dark:bg-[#000000] p-4 rounded-[12px]">
                <p className="font-semibold text-black dark:text-white">
                  Lunch & Documentation
                </p>
                <p className="text-blue-400 text-sm">1:00PM - 2:00PM</p>
                <p className="text-gray-600 dark:text-gray-400 text-xs italic">
                  Break time & updating patient records
                </p>
              </div>
              <div className="bg-[#0EFF7B1A] dark:bg-[#000000] p-4 rounded-[12px]">
                <p className="font-semibold text-black dark:text-white">
                  New Patient Consultations
                </p>
                <p className="text-blue-400 text-sm">2:00PM - 4:00PM</p>
                <p className="text-gray-600 dark:text-gray-400 text-xs italic">
                  First-time visits and detailed assessments
                </p>
              </div>
              <div className="bg-[#0EFF7B1A] dark:bg-[#000000] p-4 rounded-[12px]">
                <p className="font-semibold text-black dark:text-white">
                  Outpatient & Emergency
                </p>
                <p className="text-blue-400 text-sm">4:00PM - 7:00PM</p>
                <p className="text-gray-600 dark:text-gray-400 text-xs italic">
                  Emergency cases & urgent patient care
                </p>
              </div>
            </div>
          </div>
          {/* Availability */}
          <div>
            <h3 className="font-semibold mb-2 text-black dark:text-white">
              Availability
            </h3>
            <div className="flex gap-4">
              <span className="px-3 py-1 rounded-md bg-[#F5F6F5] dark:bg-[#0EFF7B1A] border-[2px] border-[#0EFF7B66] text-sm text-black dark:text-white shadow-[0px_0px_4px_0px_#0EFF7B40]">
                {profileData.shift_timing || "Only on weekdays (Mon-Fri)"}
              </span>
            </div>
          </div>
           <div>
                    <h3 className="font-semibold mb-3 text-black dark:text-white">
                      Certificates & Documents
                    </h3>
                    <div className="bg-[#0EFF7B1A] dark:bg-[#000000] rounded-[12px] p-4">
                      {certificates.length === 0 ? (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                          <p className="text-black dark:text-white">
                            No certificates or documents found
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-[#0EFF7B66] dark:border-[#0EFF7B66]">
                                <th className="text-left py-2 px-3 text-sm font-medium text-black dark:text-white">
                                  Document Name
                                </th>
                                <th className="text-left py-2 px-3 text-sm font-medium text-black dark:text-white">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {certificates.map((cert) => (
                                <tr
                                  key={cert.id}
                                  className="border-b border-[#0EFF7B33] dark:border-[#0EFF7B33]"
                                >
                                  <td className="py-3 px-3">
                                    <div className="flex items-center">
                                      <FileText className="h-5 w-5 text-[#08994A] dark:text-[#0EFF7B] mr-2" />
                                      <span className="text-sm text-black dark:text-white truncate max-w-[250px]">
                                        {cert.name}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-3">
                                    <div className="flex gap-2">
                                      {/* VIEW */}
  <div
    className="relative group w-8 h-8 rounded-[6px]
               border border-[#0EFF7B] dark:border-[#0EFF7B]
               bg-gray-100 dark:bg-transparent
               flex items-center justify-center
               cursor-pointer hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A]"
    onClick={() => handleViewCertificate(cert)}
  >
    <Eye
      size={16}
      className="text-[#08994A] dark:text-[#0EFF7B]"
    />
    <span
      className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap
                 px-3 py-1 text-xs rounded-md shadow-md
                 bg-gray-100 dark:bg-black text-black dark:text-white
                 opacity-0 group-hover:opacity-100
                 transition-all duration-150 z-50"
    >
      View
    </span>
  </div>
  {/* DOWNLOAD */}
  <div
    className="relative group w-8 h-8 rounded-[6px]
               border border-[#08994A] dark:border-[#0EFF7B]
               bg-[#08994A] dark:bg-[#0EFF7B33]
               flex items-center justify-center
               cursor-pointer hover:bg-[#0D7F41] dark:hover:bg-[#0EFF7B66]"
    onClick={() => handleDownloadCertificate(cert)}
  >
    <Download
      size={16}
      className="text-white"
    />
    <span
      className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap
                 px-3 py-1 text-xs rounded-md shadow-md
                 bg-gray-100 dark:bg-black text-black dark:text-white
                 opacity-0 group-hover:opacity-100
                 transition-all duration-150 z-50"
    >
      Download
    </span>
  </div>
                                    </div>
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
      </div>
     
      {/* MODAL UPDATED WITH VALIDATION */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="w-[900px] h-[600px] rounded-[20px] bg-gray-100 dark:bg-black text-black dark:text-white p-6 shadow-[0px_0px_4px_0px_rgba(255,255,255,0.12)] backdrop-blur-md relative flex flex-col">
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "20px",
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
            <div className="flex justify-between items-center pb-3 mb-4">
              <h3 className="text-lg font-semibold text-black dark:text-white">
                Edit Profile
              </h3>
              <button
                onClick={handleCloseModal}
                className="w-6 h-6 rounded-full border border-[#0EFF7B] dark:border-[#0EFF7B1A] bg-gray-100 dark:bg-[#0EFF7B1A] shadow-[0px_0px_4px_0px_#0EFF7B1A] flex items-center justify-center hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A] hover:text-[#08994A] dark:hover:text-white"
              >
                <X size={16} className="text-[#08994A] dark:text-white" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <div className="flex items-center gap-6 mb-6 p-4 border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[8px]">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-neutral-800 overflow-hidden border-2 border-[#0EFF7B]">
                    {formData.profilePicturePreview ? (
                      <img
                        src={formData.profilePicturePreview}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : profileData?.profile_picture ? (
                      <img
                        src={getProfilePictureUrl(profileData.profile_picture)}
                        alt="Current Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log(
                            "Modal image failed to load:",
                            profileData.profile_picture
                          );
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    id="profile-picture"
                    accept="image/jpeg,image/png"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const MAX_SIZE = 5 * 1024 * 1024;
                        if (file.size > MAX_SIZE) {
                          errorToast("File size must be less than 5MB.");
                          e.target.value = "";
                          return;
                        }
                        if (!['image/jpeg', 'image/png'].includes(file.type)) {
                          errorToast("Only JPG, JPEG, PNG images are allowed.");
                          e.target.value = "";
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setFormData((prev) => ({
                            ...prev,
                            profilePictureFile: file,
                            profilePicturePreview: event.target.result,
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="profile-picture"
                    className="w-[120px] h-[33px] rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent px-3 py-2 flex items-center justify-center gap-2 text-black dark:text-white font-medium text-[12px] leading-[16px] cursor-pointer hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A]"
                  >
                    Change Photo
                  </label>
                  {formData.profilePicturePreview && (
                    <button
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          profilePictureFile: null,
                          profilePicturePreview: null,
                        }));
                        const fileInput =
                          document.getElementById("profile-picture");
                        if (fileInput) fileInput.value = "";
                      }}
                      className="w-[120px] h-[28px] rounded-[8px] border border-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1 flex items-center justify-center gap-2 text-red-600 dark:text-red-400 font-medium text-[11px] hover:bg-red-100 dark:hover:bg-red-900/30"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Profile Picture Guidelines:
                  </p>
                  <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <li>• Recommended size: 500x500 pixels</li>
                    <li>• Format: JPG, JPEG, PNG</li>
                    <li>• Max file size: 5MB</li>
                    <li>• Clear, professional headshot recommended</li>
                  </ul>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {/* Name Field with Validation */}
                <div>
                  <label className="text-sm text-black dark:text-white mb-1 block">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFullNameChange}
                    onBlur={() => {
                      if (formData.name) {
                        setFormData(prev => ({
                          ...prev,
                          name: prev.name.trim()
                        }));
                      }
                      handleBlur("name");
                    }}
                    className={`w-full h-[42px] border rounded-[8px] px-[12px] py-[8px] text-sm text-black dark:text-white bg-[#F5F6F5] dark:bg-black ${
                      getFieldError("name")
                        ? "border-red-500"
                        : "border-[#0EFF7B] dark:border-[#3C3C3C]"
                    }`}
                  />
                  {getFieldError("name") && (
                    <p className="text-red-700 dark:text-red-500 text-xs mt-1 font-medium">
                      {getFieldError("name")}
                    </p>
                  )}
                </div>
               
                {/* Gender Dropdown with Validation */}
                <div>
                  <label className="text-sm text-black dark:text-white mb-1 block">
                    Gender
                  </label>
                  <Dropdown
                    value={formData.gender}
                    onChange={(val) => {
                      setFormData((prev) => ({ ...prev, gender: val }));
                      if (errors.gender) {
                        setErrors(prev => ({ ...prev, gender: "" }));
                      }
                    }}
                    options={genderOptions}
                    placeholder="Select Gender"
                    error={errors.gender}
                    required
                  />
                </div>
               
                {/* Age Field with Validation */}
                <div>
                  <label className="text-sm text-black dark:text-white mb-1 block">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleAgeChange}
                    onBlur={() => handleBlur("age")}
                    className={`w-full h-[42px] border rounded-[8px] px-[12px] py-[8px] text-sm text-black dark:text-white bg-[#F5F6F5] dark:bg-black ${
                      getFieldError("age")
                        ? "border-red-500"
                        : "border-[#0EFF7B] dark:border-[#3C3C3C]"
                    }`}
                  />
                  {getFieldError("age") && (
                    <p className="text-red-700 dark:text-red-500 text-xs mt-1 font-medium">
                      {getFieldError("age")}
                    </p>
                  )}
                </div>
               
                {/* Blood Group Dropdown */}
                <div>
                  <label className="text-sm text-black dark:text-white mb-1 block">
                    Blood Group
                  </label>
                  <Dropdown
                    value={formData.bloodGroup}
                    onChange={(val) =>
                      setFormData((prev) => ({ ...prev, bloodGroup: val }))
                    }
                    options={bloodGroupOptions}
                    placeholder="Select Blood Group"
                  />
                </div>
               
                {/* Contact Field with Validation */}
                <div>
                  <label className="text-sm text-black dark:text-white mb-1 block">
                    Contact <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contact"
                    value={formData.contact}
                    onChange={handlePhoneChange}
                    onBlur={() => handleBlur("contact")}
                    maxLength="10"
                    className={`w-full h-[42px] border rounded-[8px] px-[12px] py-[8px] text-sm text-black dark:text-white bg-[#F5F6F5] dark:bg-black ${
                      getFieldError("contact")
                        ? "border-red-500"
                        : "border-[#0EFF7B] dark:border-[#3C3C3C]"
                    }`}
                  />
                  {getFieldError("contact") && (
                    <p className="text-red-700 dark:text-red-500 text-xs mt-1 font-medium">
                      {getFieldError("contact")}
                    </p>
                  )}
                </div>
               
                {/* Email Field with Validation */}
                <div>
                  <label className="text-sm text-black dark:text-white mb-1 block">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleEmailChange}
                    onBlur={() => {
                      if (formData.email) {
                        setFormData(prev => ({
                          ...prev,
                          email: prev.email.trim()
                        }));
                      }
                      handleBlur("email");
                    }}
                    className={`w-full h-[42px] border rounded-[8px] px-[12px] py-[8px] text-sm text-black dark:text-white bg-[#F5F6F5] dark:bg-black ${
                      getFieldError("email")
                        ? "border-red-500"
                        : "border-[#0EFF7B] dark:border-[#3C3C3C]"
                    }`}
                  />
                  {getFieldError("email") && (
                    <p className="text-red-700 dark:text-red-500 text-xs mt-1 font-medium">
                      {getFieldError("email")}
                    </p>
                  )}
                </div>
               
                {/* Education Field */}
                <div>
                  <label className="text-sm text-black dark:text-white mb-1 block">
                    Education
                  </label>
                  <input
                    type="text"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    className="w-full h-[42px] border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[8px] px-[12px] py-[8px] text-sm text-black dark:text-white bg-[#F5F6F5] dark:bg-black"
                  />
                </div>
               
                {/* Experience Field */}
                <div>
                  <label className="text-sm text-black dark:text-white mb-1 block">
                    Experience
                  </label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full h-[42px] border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[8px] px-[12px] py-[8px] text-sm text-black dark:text-white bg-[#F5F6F5] dark:bg-black"
                  />
                </div>
               
                {/* Department Dropdown with Validation */}
                <div>
                  <label className="text-sm text-black dark:text-white mb-1 block">
                    Department
                  </label>
                  <Dropdown
                    value={formData.department_id}
                    onChange={handleDepartmentChange}
                    options={departments}
                    placeholder={
                      departmentsLoading
                        ? "Loading departments..."
                        : "Select Department"
                    }
                    disabled={departmentsLoading}
                    loading={departmentsLoading}
                    error={errors.department_id}
                 
                  />
                </div>
               
                {/* License Number Field */}
                <div>
                  <label className="text-sm text-black dark:text-white mb-1 block">
                    License Number
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    className="w-full h-[42px] border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[8px] px-[12px] py-[8px] text-sm text-black dark:text-white bg-[#F5F6F5] dark:bg-black"
                  />
                </div>
               
                {/* Specialization Field */}
                <div>
                  <label className="text-sm text-black dark:text-white mb-1 block">
                    Specialization
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className="w-full h-[42px] border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[8px] px-[12px] py-[8px] text-sm text-black dark:text-white bg-[#F5F6F5] dark:bg-black"
                  />
                </div>
               
                {/* Board Certifications Field */}
                <div>
                  <label className="text-sm text-black dark:text-white mb-1 block">
                    Board Certifications
                  </label>
                  <input
                    type="text"
                    name="boardCertifications"
                    value={formData.boardCertifications}
                    onChange={handleInputChange}
                    className="w-full h-[42px] border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[8px] px-[12px] py-[8px] text-sm text-black dark:text-white bg-[#F5F6F5] dark:bg-black"
                  />
                </div>
               
                {/* Professional Memberships Field */}
                <div>
                  <label className="text-sm text-black dark:text-white mb-1 block">
                    Professional Memberships
                  </label>
                  <input
                    type="text"
                    name="professionalMemberships"
                    value={formData.professionalMemberships}
                    onChange={handleInputChange}
                    className="w-full h-[42px] border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[8px] px-[12px] py-[8px] text-sm text-black dark:text-white bg-[#F5F6F5] dark:bg-black"
                  />
                </div>
               
                {/* Languages Spoken Field */}
                <div>
                  <label className="text-sm text-black dark:text-white mb-1 block">
                    Languages Spoken
                  </label>
                  <input
                    type="text"
                    name="languagesSpoken"
                    value={formData.languagesSpoken}
                    onChange={handleInputChange}
                    className="w-full h-[42px] border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[8px] px-[12px] py-[8px] text-sm text-black dark:text-white bg-[#F5F6F5] dark:bg-black"
                  />
                </div>
               
                {/* Awards & Recognitions Field */}
                <div>
                  <label className="text-sm text-black dark:text-white mb-1 block">
                    Awards & Recognitions
                  </label>
                  <input
                    type="text"
                    name="awards"
                    value={formData.awards}
                    onChange={handleInputChange}
                    className="w-full h-[42px] border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[8px] px-[12px] py-[8px] text-sm text-black dark:text-white bg-[#F5F6F5] dark:bg-black"
                  />
                </div>
               
                {/* Shift Timing Field */}
                <div>
                  <label className="text-sm text-black dark:text-white mb-1 block">
                    Shift Timing
                  </label>
                  <input
                    type="text"
                    name="shiftTiming"
                    value={formData.shiftTiming}
                    onChange={handleInputChange}
                    className="w-full h-[42px] border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[8px] px-[12px] py-[8px] text-sm text-black dark:text-white bg-[#F5F6F5] dark:bg-black"
                    placeholder="e.g., 09:00 AM - 05:00 PM"
                  />
                </div>
               
                {/* About Physician Textarea */}
                <div className="col-span-3">
                  <label className="text-sm text-black dark:text-white mb-1 block">
                    About Physician
                  </label>
                  <textarea
                    name="aboutPhysician"
                    value={formData.aboutPhysician}
                    onChange={handleInputChange}
                    className="w-full h-[100px] border border-[#0EFF7B] dark:border-[#3C3C3C] rounded-[8px] px-[12px] py-[8px] text-sm text-black dark:text-white bg-[#F5F6F5] dark:bg-black"
                    placeholder="Dedicated to providing compassionate, patient-centered care."
                  />
                </div>
               
                {/* Status Dropdown */}
                <div>
                  <label className="text-sm text-black dark:text-white mb-1 block">
                    Status
                  </label>
                  <Dropdown
                    value={formData.status}
                    onChange={(val) =>
                      setFormData((prev) => ({ ...prev, status: val }))
                    }
                    options={statusOptions}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <button
                onClick={handleCloseModal}
                className="w-[104px] h-[33px] rounded-[8px] border border-[#0EFF7B] dark:border-[#3A3A3A] bg-gray-100 dark:bg-transparent px-3 py-2 flex items-center justify-center gap-2 text-black dark:text-white font-medium text-[14px] leading-[16px] shadow-[0px_2px_12px_0px_rgba(0,0,0,0.25)] hover:bg-[#0EFF7B1A] dark:hover:bg-[#0EFF7B1A] hover:text-[#08994A] dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="w-[104px] h-[33px] rounded-[8px] px-3 py-2 flex items-center justify-center gap-2 border-b-[2px] border-[#0EFF7B66] dark:border-[#0EFF7B66] text-white font-medium text-[14px] leading-[16px] hover:scale-105 transition"
                style={{
                  background:
                    "linear-gradient(92.18deg, #025126 3.26%, #0D7F41 50.54%, #025126 97.83%)",
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      <style>
        {`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>
    </div>
  );
};
export default DoctorProfile;
