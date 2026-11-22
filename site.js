(function(){
  var b=document.getElementById("menuBtn"),n=document.getElementById("nav");
  if(b&&n){ b.addEventListener("click",function(){ var o=n.classList.toggle("open"); b.setAttribute("aria-expanded",o); b.setAttribute("aria-label",o?"Close menu":"Open menu"); }); }
  document.querySelectorAll("[data-year]").forEach(function(e){ e.textContent=new Date().getFullYear(); });
  var f=document.getElementById("enqForm");
  if(f){ f.addEventListener("submit",function(e){
    e.preventDefault(); var note=document.getElementById("enqNote"),btn=f.querySelector("button[type=submit]");
    btn.disabled=true; btn.textContent="Sending";
    fetch("/",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams(new FormData(f)).toString()})
      .then(function(r){ if(!r.ok) throw 0; f.reset(); note.textContent="Thank you. We'll be in touch soon."; btn.textContent="Sent"; })
      .catch(function(){ note.textContent="That didn't send. Please try again, or email us."; btn.disabled=false; btn.textContent="Send enquiry"; });
  }); }
})();
