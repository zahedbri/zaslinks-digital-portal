// Zaslinks-Digital shared JS
window.App = (function(){
  const $ = (s,p=document)=>p.querySelector(s);
  const $$ = (s,p=document)=>[...p.querySelectorAll(s)];

  const store = {
    get users(){return JSON.parse(localStorage.getItem('zd_users')||'[]')},
    set users(v){localStorage.setItem('zd_users', JSON.stringify(v))},
    get session(){return JSON.parse(localStorage.getItem('zd_session')||'null')},
    set session(v){localStorage.setItem('zd_session', JSON.stringify(v))},
    keySaved(email){return `zd_saved_${email||'anon'}`},
    getSaved(email){return JSON.parse(localStorage.getItem(this.keySaved(email))||'[]')},
    setSaved(email,v){localStorage.setItem(this.keySaved(email), JSON.stringify(v))}
  };

  // Chatbot
  function initChatbot(){
    const chatbot = $('#chatbot'); if(!chatbot) return;
    const chatBody = $('#chat-body'), chatInput = $('#chat-input');
    const sendBtn = $('#send-btn'), minBtn = $('#minChat');

    function addMsg(text, me=false){
      const d=document.createElement('div'); d.className='msg '+(me?'me':'bot'); d.textContent=text;
      chatBody.appendChild(d); chatBody.scrollTop = chatBody.scrollHeight;
    }
    function botReply(text){
      const t=document.createElement('div'); t.className='msg bot typing'; t.textContent='Typing...';
      chatBody.appendChild(t); chatBody.scrollTop = chatBody.scrollHeight;
      setTimeout(()=>{ t.remove(); addMsg(text,false); }, 700);
    }
    function toggleChat(){
      chatbot.style.height = (chatbot.style.height === '46px') ? '460px' : '46px';
    }
    function parseAndSearch(q){
      const text=q.toLowerCase();
      const types=[['internship','internship'],['placement','internship'],['apprenticeship','apprenticeship'],['part-time','parttime'],['part time','parttime'],['graduate','graduate']];
      let type='any'; types.forEach(([k,v])=>{ if(text.includes(k)) type=v; });
      let loc=''; const at=text.indexOf(' in '); if(at>0) loc=q.slice(at+4).trim();
      let keyword=q.replace(/in\s+.+$/i,'').replace(/find|show|search|jobs|roles|positions|vacancies/gi,'').trim(); if(!keyword) keyword='student';
      const params={ q:keyword, loc, type, country: text.match(/germany|france|spain|italy|netherlands|ireland/i) ? 'eu':'uk' };

      if ($('#providerLinks')) { renderProviderLinks(params); }
      botReply(`Prepared searches for "${params.q}" ${params.loc?('in '+params.loc):''} (${params.type}). Use the cards above.`);
    }
    function handleSend(){
      const q=chatInput?.value?.trim?.()||''; if(!q) return;
      addMsg(q,true); chatInput.value=''; setTimeout(()=>parseAndSearch(q), 400);
    }

    if (sendBtn && typeof sendBtn.addEventListener==='function') sendBtn.addEventListener('click', handleSend);
    if (chatInput && typeof chatInput.addEventListener==='function') chatInput.addEventListener('keydown', e=>{ if(e.key==='Enter') handleSend(); });
    if (minBtn && typeof minBtn.addEventListener==='function') minBtn.addEventListener('click', toggleChat);
    else document.addEventListener('click', e=>{ if(e.target && e.target.id==='minChat') toggleChat(); });

    botReply('Hi! I can help you find student jobs. Try: "Find marketing internships in London"');
    console.log('Chatbot initialized ✅');
  }

  // Providers
  const providers = [
    { name:'Indeed', id:'indeed', url:({q,loc,type})=>{ const base='https://uk.indeed.com/jobs'; const qp=new URLSearchParams({q:q||'',l:loc||''}); if(type==='parttime') qp.set('jt','parttime'); if(type==='internship') qp.set('jt','internship'); return `${base}?${qp.toString()}` } },
    { name:'LinkedIn Jobs', id:'linkedin', url:({q,loc})=> `https://www.linkedin.com/jobs/search/?${new URLSearchParams({keywords:q||'',location:loc||''}).toString()}` },
    { name:'Reed', id:'reed', url:({q,loc})=> `https://www.reed.co.uk/jobs/${encodeURIComponent(q||'jobs')}-jobs-in-${encodeURIComponent(loc||'')}` },
    { name:'GOV.UK Apprenticeships', id:'govuk', url:({q,loc})=> `https://www.findapprenticeship.service.gov.uk/apprenticeshipsearch?${new URLSearchParams({SearchTerm:q||'',Location:loc||''}).toString()}` },
    { name:'StudentJob UK', id:'studentjob', url:({q,loc})=> `https://www.studentjob.co.uk/search?${new URLSearchParams({keywords:q||'',location:loc||''}).toString()}` },
  ];
  function renderProviderLinks(params){
    const wrap = $('#providerLinks'); if(!wrap) return;
    wrap.innerHTML='';
    providers.forEach(p=>{
      const a=document.createElement('a');
      a.className='card'; a.target='_blank'; a.rel='noopener noreferrer'; a.href=p.url(params);
      a.innerHTML=`<strong>${p.name}</strong><div class="tag">Open results</div>`;
      wrap.appendChild(a);
    });
    const findP = id=>providers.find(p=>p.id===id);
    if($('#top-indeed')) $('#top-indeed').href = findP('indeed').url(params);
    if($('#top-linkedin')) $('#top-linkedin').href = findP('linkedin').url(params);
    if($('#top-gov')) $('#top-gov').href = findP('govuk').url(params);
    if($('#top-reed')) $('#top-reed').href = findP('reed').url(params);
  }

  // Saved jobs
  function renderSaved(){
    const email=store.session?.email||'anon';
    const list=$('#savedList'); if(!list) return;
    const saved=store.getSaved(email); list.innerHTML='';
    if(!saved.length){ list.innerHTML='<p class="muted">No saved jobs yet.</p>'; return; }
    saved.forEach((s,idx)=>{
      const row=document.createElement('div'); row.className='saved-item';
      row.innerHTML=`<div><a href="${s.url}" target="_blank"><strong>${s.title}</strong></a><div class="tag" style="margin-top:4px">Saved ${new Date(s.added).toLocaleString()}</div></div>
      <div style="display:flex;gap:6px"><button class="btn ghost" data-open="${idx}">Open</button><button class="btn" data-del="${idx}">Remove</button></div>`;
      list.appendChild(row);
    });
    $$('#savedList [data-del]').forEach(b=>b.addEventListener('click',()=>{
      const email=store.session?.email||'anon'; const saved=store.getSaved(email);
      saved.splice(parseInt(b.dataset.del,10),1); store.setSaved(email,saved); renderSaved();
    }));
    $$('#savedList [data-open]').forEach(b=>b.addEventListener('click',()=>{
      const email=store.session?.email||'anon'; const saved=store.getSaved(email);
      const it=saved[parseInt(b.dataset.open,10)]; if(it) window.open(it.url,'_blank');
    }));
  }

  // Auth
  function bindAuth(){
    const authDlg = $('#authDlg'); if(!authDlg) return;
    const loginBtn = $('#loginBtn'), registerBtn=$('#registerBtn'), closeAuth=$('#closeAuth');
    const authTitle = $('#authTitle'), authMsg = $('#authMsg');
    const loginForm = $('#loginForm'), registerForm = $('#registerForm');

    function refreshWelcome(){
      const s=store.session; const tag=$('#welcomeTag'); if(tag) tag.textContent = s?.email ? `Signed in as ${s.name||s.email}` : 'Not signed in';
      renderSaved();
    }

    loginBtn && loginBtn.addEventListener('click',()=>{ authTitle.textContent='Login'; authMsg.textContent=''; authDlg.showModal(); });
    registerBtn && registerBtn.addEventListener('click',()=>{ authTitle.textContent='Create your account'; authMsg.textContent=''; authDlg.showModal(); });
    closeAuth && closeAuth.addEventListener('click',()=> authDlg.close());

    registerForm && registerForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const f = new FormData(e.target);
      const user = { name:f.get('name').trim(), email:f.get('email').trim().toLowerCase(), password:f.get('password') };
      if(store.users.find(u=>u.email===user.email)){ authMsg.textContent='Account already exists'; return; }
      store.users=[...store.users, user]; store.session={email:user.email, name:user.name}; authDlg.close(); refreshWelcome(); toast('Welcome, '+(user.name||user.email));
    });

    loginForm && loginForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const f=new FormData(e.target); const email=f.get('email').trim().toLowerCase(); const pass=f.get('password');
      const user=store.users.find(u=>u.email===email && u.password===pass);
      if(!user){ authMsg.textContent='Invalid credentials'; return; }
      store.session={email:user.email, name:user.name}; authDlg.close(); refreshWelcome(); toast('Logged in');
    });

    const logoutBtn = $('#logoutBtn');
    logoutBtn && logoutBtn.addEventListener('click', ()=>{ store.session=null; refreshWelcome(); toast('Logged out'); });

    refreshWelcome();
  }

  function toast(msg){
    const el=document.createElement('div'); el.textContent=msg;
    el.style.cssText='position:fixed;left:50%;top:18px;transform:translateX(-50%);background:#ecfeff;color:#065f46;border:1px solid #99f6e4;padding:10px 14px;border-radius:12px;z-index:1000;box-shadow:0 10px 24px rgba(0,0,0,.15)';
    document.body.appendChild(el); setTimeout(()=>el.remove(),1800);
  }

  // Public initializers
  function initHome(){
    document.getElementById('year').textContent = new Date().getFullYear();
    initChatbot();
    console.assert(!!document.getElementById('chatbot'), 'TEST FAIL (home): chatbot missing');
  }
  function initPortal(){
    document.getElementById('year').textContent = new Date().getFullYear();
    bindAuth(); initChatbot();
    const searchForm = $('#searchForm'); const saveBtn=$('#saveBtn');
    searchForm && searchForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const params={ q:$('#q').value.trim(), loc:$('#loc').value.trim(), type:$('#type').value, country:$('#country').value };
      renderProviderLinks(params); toast('Search prepared — open a card to view results');
      console.assert($('#providerLinks').children.length>0, 'TEST FAIL (portal): provider cards not rendered');
    });
    saveBtn && saveBtn.addEventListener('click', ()=>{
      const title=$('#saveTitle').value.trim(), url=$('#saveUrl').value.trim();
      if(!title || !/^https?:\/\//i.test(url)) return toast('Add a title + valid http(s) URL');
      const email=store.session?.email||'anon'; const saved=store.getSaved(email);
      saved.unshift({title,url,added:Date.now()}); store.setSaved(email,saved); $('#saveTitle').value=''; $('#saveUrl').value=''; renderSaved(); toast('Saved');
      console.assert($('#savedList').children.length>0, 'TEST FAIL (portal): save did not render');
    });
    renderProviderLinks({ q:'student', loc:'United Kingdom', type:'any', country:'uk' });
    renderSaved();
    console.log('Portal initialized ✅');
  }

  return { initHome, initPortal };
})();