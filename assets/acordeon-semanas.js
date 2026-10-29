/* Visor interno: abre los archivos dentro del portafolio (ventana emergente) */
(function(){
  var box=document.createElement('div');
  box.className='vz';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label','Visor de archivos');
  box.innerHTML='<div class="vz-box"><div class="vz-head"><span class="vz-name"></span>'+
    '<a class="acc-btn vz-open" target="_blank" rel="noopener">↗ Nueva pestaña</a>'+
    '<a class="acc-btn dl vz-dl" download>↓ Descargar</a>'+
    '<button class="vz-x" type="button" aria-label="Cerrar">✕</button></div>'+
    '<iframe class="vz-frame" title="Vista del archivo"></iframe>'+
    '<div class="vz-foot">Si el archivo no se ve en tu dispositivo, usa «Nueva pestaña» o «Descargar».</div></div>';
  document.body.appendChild(box);
  var fr=box.querySelector('.vz-frame'),nm=box.querySelector('.vz-name'),op=box.querySelector('.vz-open'),dl=box.querySelector('.vz-dl');
  function close(){box.classList.remove('on');fr.src='about:blank';document.body.style.overflow=''}
  function open(href,name,dlHref){
    nm.textContent=name;op.href=href;dl.href=dlHref||href;
    fr.src=href;box.classList.add('on');document.body.style.overflow='hidden';
  }
  box.addEventListener('click',function(e){if(e.target===box||e.target.closest('.vz-x'))close()});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&box.classList.contains('on'))close()});
  document.addEventListener('click',function(e){
    var a=e.target.closest('.acc-file a.acc-btn:not(.dl)');
    if(!a||e.ctrlKey||e.metaKey||e.shiftKey||e.button!==0)return;
    e.preventDefault();
    var row=a.closest('.acc-file'),d=row.querySelector('a.dl');
    open(a.getAttribute('href'),row.querySelector('.acc-fn').textContent,d&&d.getAttribute('href'));
  });
})();
