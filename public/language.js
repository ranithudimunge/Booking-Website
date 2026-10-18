const translations = {
  en: { select:"Select a space", create:"Create booking", bookings:"Bookings", name:"Customer name", contact:"Contact details", alcohol:"Will alcohol be used during this booking?", services:"Extra services", notes:"Notes", cancel:"Cancel booking" },
  si: { select:"ස්ථානයක් තෝරන්න", create:"වෙන් කිරීම සාදන්න", bookings:"වෙන් කිරීම්", name:"පාරිභෝගික නම", contact:"සම්බන්ධතා විස්තර", alcohol:"මෙම වෙන් කිරීමේදී මත්පැන් භාවිතා කරන්නේද?", services:"අමතර සේවා", notes:"සටහන්", cancel:"වෙන් කිරීම අවලංගු කරන්න" },
  ta: { select:"இடத்தைத் தேர்ந்தெடுக்கவும்", create:"முன்பதிவை உருவாக்கவும்", bookings:"முன்பதிவுகள்", name:"வாடிக்கையாளர் பெயர்", contact:"தொடர்பு விவரங்கள்", alcohol:"இந்த முன்பதிவில் மதுபானம் பயன்படுத்தப்படுமா?", services:"கூடுதல் சேவைகள்", notes:"குறிப்புகள்", cancel:"முன்பதிவை ரத்து செய்" }
};
function setLanguage(code) {
  const t = translations[code];
  document.documentElement.lang = code;
  document.querySelector("header p").textContent = code === "en" ? "Select a space, then create its booking." : code === "si" ? "ස්ථානයක් තෝරා වෙන් කිරීම සාදන්න." : "இடத்தைத் தேர்ந்தெடுத்து முன்பதிவை உருவாக்கவும்.";
  document.querySelector(".panel h2").textContent = t.select;
  document.querySelector("#bookingPanel h2").textContent ||= "";
  document.querySelector("#form button").textContent = t.create;
  document.querySelector("#list").closest(".panel").querySelector("h2").textContent = t.bookings;
  document.querySelector('label[for="name"], #name').closest('label').childNodes[0].textContent = t.name;
  document.querySelector('#contact').closest('label').childNodes[0].textContent = t.contact;
  document.querySelector('#alcohol').closest('label').childNodes[0].textContent = t.alcohol;
  document.querySelectorAll('label').forEach(l => { if (l.textContent.trim() === 'Extra services') l.textContent = t.services; if (l.textContent.trim() === 'Notes') l.childNodes[0].textContent = t.notes; });
  localStorage.setItem("bookingLanguage", code);
}
const chooser = document.createElement("select");
chooser.id = "languageChooser";
chooser.innerHTML = '<option value="en">English</option><option value="si">සිංහල</option><option value="ta">தமிழ்</option>';
chooser.style.cssText = "position:absolute;right:24px;top:22px;width:auto;padding:8px";
chooser.value = localStorage.getItem("bookingLanguage") || "en";
chooser.onchange = () => setLanguage(chooser.value);
document.querySelector("header").append(chooser);
setLanguage(chooser.value);
