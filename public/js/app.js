const API = (window.JUHUD_CONFIG?.API_BASE_URL || "").replace(/\/$/, "");
const $ = id => document.getElementById(id);
let currentUser = null, activityTypes = [], records = [], language = "en";
const messages = {
  en:{welcome:"A clearer way to manage people and activities.",intro:"One secure workspace for profiles, periodic updates and administrative review.",feature1:"Personal information",feature2:"Daily to yearly activities",feature3:"Review and reporting workflow",signIn:"Sign in",loginWith:"Login using",identifier:"NRIC / Passport / Email / WhatsApp",password:"Password",accountNote:"Accounts are created by an administrator.",logout:"Logout",workspace:"WORKSPACE",dashboard:"Dashboard",myProfile:"My Profile",activities:"Activities",administration:"Administration",mySubmissions:"My submissions",pendingReview:"Pending review",accountStatus:"Account status",active:"Active",recentActivity:"Recent activity",viewAll:"View all",personalProfile:"Personal profile",profileHint:"Keep your contact and address information up to date.",dateOfBirth:"Date of birth",gender:"Gender",marital:"Marital status",nationality:"Nationality",country:"Country",state:"State / Province",city:"City / District",postcode:"Postcode",street:"Street address",buildingNo:"Building number",buildingName:"Building name",address2:"Address line 2",saveProfile:"Save profile",submitActivity:"Submit an activity",activityType:"Activity type",activityDate:"Activity date",periodStart:"Period start (optional)",periodEnd:"Period end (optional)",description:"Description / update",progress:"Progress",submitForReview:"Submit for review",myHistory:"My activity history",createUser:"Create user",fullName:"Full name",loginType:"Primary login type",loginIdentifier:"Login identifier",emailOptional:"Email (optional)",whatsappOptional:"WhatsApp (optional)",temporaryPassword:"Initial password (12+ characters)",role:"Role",createAccount:"Create account",users:"Users",createActivityType:"Create activity type",activityName:"Activity name",frequency:"Frequency",createActivity:"Create activity",reviewSubmissions:"Review submissions",footer:"People, activities and progress"},
  my:{welcome:"Cara lebih jelas untuk mengurus pengguna dan aktiviti.",intro:"Satu ruang kerja selamat untuk profil, kemas kini berkala dan semakan pentadbir.",feature1:"Maklumat peribadi",feature2:"Aktiviti harian hingga tahunan",feature3:"Aliran semakan dan laporan",signIn:"Log masuk",loginWith:"Log masuk menggunakan",identifier:"NRIC / Pasport / E-mel / WhatsApp",password:"Kata laluan",accountNote:"Akaun didaftarkan oleh pentadbir.",logout:"Log keluar",workspace:"RUANG KERJA",dashboard:"Papan pemuka",myProfile:"Profil saya",activities:"Aktiviti",administration:"Pentadbiran",mySubmissions:"Penyerahan saya",pendingReview:"Menunggu semakan",accountStatus:"Status akaun",active:"Aktif",recentActivity:"Aktiviti terkini",viewAll:"Lihat semua",personalProfile:"Profil peribadi",profileHint:"Pastikan maklumat hubungan dan alamat sentiasa dikemas kini.",dateOfBirth:"Tarikh lahir",gender:"Jantina",marital:"Status perkahwinan",nationality:"Warganegara",country:"Negara",state:"Negeri / Wilayah",city:"Bandar / Daerah",postcode:"Poskod",street:"Alamat jalan",buildingNo:"Nombor bangunan",buildingName:"Nama bangunan",address2:"Baris alamat 2",saveProfile:"Simpan profil",submitActivity:"Hantar aktiviti",activityType:"Jenis aktiviti",activityDate:"Tarikh aktiviti",periodStart:"Mula tempoh (pilihan)",periodEnd:"Akhir tempoh (pilihan)",description:"Penerangan / kemas kini",progress:"Kemajuan",submitForReview:"Hantar untuk semakan",myHistory:"Sejarah aktiviti saya",createUser:"Cipta pengguna",fullName:"Nama penuh",loginType:"Jenis log masuk utama",loginIdentifier:"Pengenal log masuk",emailOptional:"E-mel (pilihan)",whatsappOptional:"WhatsApp (pilihan)",temporaryPassword:"Kata laluan awal (12+ aksara)",role:"Peranan",createAccount:"Cipta akaun",users:"Pengguna",createActivityType:"Cipta jenis aktiviti",activityName:"Nama aktiviti",frequency:"Kekerapan",createActivity:"Cipta aktiviti",reviewSubmissions:"Semak penyerahan",footer:"Pengguna, aktiviti dan kemajuan"}
};
function t(key){return messages[language][key] || messages.en[key] || key}
function applyLanguage(){document.documentElement.lang=language;document.querySelectorAll("[data-i18n]").forEach(el=>el.textContent=t(el.dataset.i18n));}
async function api(path, options={}) {
  if(!API || API.includes("REPLACE_WITH")) throw new Error("Configure public/config.js with your Cloudflare Worker URL first.");
  const response=await fetch(API+path,{...options,credentials:"include",headers:{"Content-Type":"application/json",...(sessionStorage.getItem("juhud_token")?{"Authorization":"Bearer "+sessionStorage.getItem("juhud_token")}:{ }),...(options.headers||{})}});
  const data=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}
function showMessage(id,msg,error=false){const el=$(id);el.textContent=msg;el.classList.toggle("error",error)}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function dateToday(){return new Date().toISOString().slice(0,10)}
function tag(status){const s=String(status||"").toLowerCase();return `<span class="tag ${s}">${escapeHtml(status||"—")}</span>`}
function table(headers,rows){return `<table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.length?rows.join(""):`<tr><td colspan="${headers.length}" class="muted">No records yet</td></tr>`}</tbody></table>`}
function isAdmin(){return currentUser?.roles?.some(r=>["SUPER_ADMIN","ADMIN"].includes(r))}
function canReview(){return currentUser?.roles?.some(r=>["SUPER_ADMIN","ADMIN","SUPERVISOR"].includes(r))}
function switchView(name){document.querySelectorAll(".view").forEach(v=>v.classList.add("hidden"));$(`${name}Panel`).classList.remove("hidden");document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.view===name));if(name==="admin")loadAdmin().catch(e=>alert(e.message));}
async function loadMe() {
  const data = await api("/api/auth/me");

  currentUser = {
    ...data.user,
    fullName: data.user.full_name,
    roles: data.roles || []
  };

  $("loginView").classList.add("hidden");
  $("appView").classList.remove("hidden");
  $("logoutBtn").classList.remove("hidden");

  $("greeting").textContent =
    `${language === "my" ? "Selamat datang" : "Welcome"}, ${currentUser.fullName}`;

  $("rolePill").textContent = currentUser.roles.join(" · ");

  document.querySelectorAll(".admin-only").forEach(x =>
    x.classList.toggle("hidden", !isAdmin() && !canReview())
  );

  switchView("dashboard");
}async function loadActivities(){
  const d=await api("/api/activities");activityTypes=d.types;records=d.records;
  $("activityType").innerHTML=activityTypes.map(x=>`<option value="${x.activity_type_id}">${escapeHtml(x.activity_name)} (${escapeHtml(x.frequency)})</option>`).join("");
  $("statMine").textContent=records.length;$("statPending").textContent=records.filter(x=>x.review_status==="PENDING").length;
  const rows=records.slice(0,5).map(r=>`<tr><td>${escapeHtml(r.activity_name)}</td><td>${escapeHtml(r.activity_date)}</td><td>${tag(r.review_status)}</td></tr>`);
  $("recentRecords").innerHTML=table(["Activity","Date","Review"],rows);
  $("activityHistory").innerHTML=table(["Activity","Date","Progress","Review"],records.map(r=>`<tr><td>${escapeHtml(r.activity_name)}</td><td>${escapeHtml(r.activity_date)}</td><td>${escapeHtml(r.progress_status)}</td><td>${tag(r.review_status)}</td></tr>`));
}
async function loadAdmin(){
  if(isAdmin()){
    const d=await api("/api/admin/users");
    $("usersTable").innerHTML=table(["Name","Login identifiers","Role","Status"],d.users.map(u=>`<tr><td>${escapeHtml(u.full_name)}</td><td>${escapeHtml(u.identifiers||"—")}</td><td>${escapeHtml(u.roles||"USER")}</td><td>${tag(u.account_status)}</td></tr>`));
    const a=await api("/api/admin/activity-types");
    // Activity types are displayed in the user activity selector; this panel keeps the admin workflow visible.
  }
  if(canReview()){
    const d=await api("/api/admin/submissions");
    $("submissionsTable").innerHTML=table(["User","Activity","Date","Status","Review"],d.submissions.map(s=>`<tr><td>${escapeHtml(s.full_name)}</td><td>${escapeHtml(s.activity_name)}<br><span class="muted">${escapeHtml(s.description)}</span></td><td>${escapeHtml(s.activity_date)}</td><td>${tag(s.review_status)}</td><td>${s.review_status==="PENDING"?`<button class="table-action" data-review="${s.record_id}" data-status="APPROVED">Approve</button><button class="table-action" data-review="${s.record_id}" data-status="NEEDS_REVISION">Revise</button><button class="table-action" data-review="${s.record_id}" data-status="REJECTED">Reject</button>`:"—"}</td></tr>`));
    $("submissionsTable").querySelectorAll("[data-review]").forEach(btn=>btn.addEventListener("click",async()=>{const remarks=prompt("Reviewer remarks (optional):")||"";try{await api(`/api/admin/submissions/${btn.dataset.review}`,{method:"PATCH",body:JSON.stringify({reviewStatus:btn.dataset.status,remarks})});await loadAdmin();}catch(e){alert(e.message)}}));
  }
}
$("loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  showMessage("loginMessage", "");

  try {
    const loginResult = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: $("loginIdentifier").value,
        password: $("password").value
      })
    });

    sessionStorage.setItem("juhud_token", loginResult.token);
    await loadMe();

  } catch (err) {
    showMessage("loginMessage", err.message, true);
  }
});
$("logoutBtn").addEventListener("click",async()=>{try{await api("/api/auth/logout",{method:"POST"});}finally{sessionStorage.removeItem("juhud_token");currentUser=null;$("appView").classList.add("hidden");$("loginView").classList.remove("hidden");$("logoutBtn").classList.add("hidden");$("password").value="";}});
$("languageSelect").addEventListener("change",e=>{language=e.target.value;applyLanguage();if(currentUser)$("greeting").textContent=`${language==="my"?"Selamat datang":"Welcome"}, ${currentUser.fullName}`;});
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>switchView(b.dataset.view)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>switchView(b.dataset.go)));
$("profileForm").addEventListener("submit",async e=>{e.preventDefault();const body={date_of_birth:$("dob").value,gender:$("gender").value,marital_status:$("marital").value,nationality:$("nationality").value,country:$("country").value,state_province:$("state").value,city_district:$("city").value,postcode:$("postcode").value,street_address:$("street").value,building_number:$("buildingNo").value,building_name:$("buildingName").value,address_line_2:$("address2").value};try{await api("/api/profile",{method:"PUT",body:JSON.stringify(body)});showMessage("profileMessage",language==="my"?"Profil disimpan.":"Profile saved.");}catch(e){showMessage("profileMessage",e.message,true)}});
$("activityDate").value=dateToday();
$("activityForm").addEventListener("submit",async e=>{e.preventDefault();try{await api("/api/activities",{method:"POST",body:JSON.stringify({activityTypeId:$("activityType").value,activityDate:$("activityDate").value,periodStart:$("periodStart").value,periodEnd:$("periodEnd").value,description:$("activityDescription").value,progressStatus:$("progress").value})});$("activityDescription").value="";showMessage("activityMessage",language==="my"?"Aktiviti dihantar untuk semakan.":"Activity submitted for review.");await loadActivities();}catch(e){showMessage("activityMessage",e.message,true)}});
$("createUserForm").addEventListener("submit",async e=>{e.preventDefault();try{await api("/api/admin/users",{method:"POST",body:JSON.stringify({fullName:$("newFullName").value,loginType:$("newLoginType").value,loginIdentifier:$("newIdentifier").value,email:$("newEmail").value,whatsapp:$("newWhatsApp").value,password:$("newPassword").value,role:$("newRole").value})});showMessage("createUserMessage","User created.");$("createUserForm").reset();await loadAdmin();}catch(e){showMessage("createUserMessage",e.message,true)}});
$("createTypeForm").addEventListener("submit",async e=>{e.preventDefault();try{await api("/api/admin/activity-types",{method:"POST",body:JSON.stringify({activityName:$("typeName").value,frequency:$("typeFrequency").value,description:$("typeDescription").value})});showMessage("createTypeMessage","Activity type created.");$("createTypeForm").reset();await loadActivities();}catch(e){showMessage("createTypeMessage",e.message,true)}});
applyLanguage();
if (sessionStorage.getItem("juhud_token")) {
  loadMe().catch(() => {
    sessionStorage.removeItem("juhud_token");
  });
}
