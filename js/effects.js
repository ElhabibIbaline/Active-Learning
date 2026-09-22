// Active Learning — micro-interactions partagées entre les modules
window.AL = window.AL || {};

// Confetti déclenché depuis les coordonnées écran (x, y) d'un bouton, par ex.
AL.confetti = function(x, y){
  var colors = ['var(--gold)','var(--sage)','var(--brick)','var(--focus)'];
  for(var i=0; i<22; i++){
    var el = document.createElement('span');
    el.style.cssText = 'position:fixed;left:'+x+'px;top:'+y+'px;width:6px;height:6px;'
      + 'border-radius:2px;pointer-events:none;z-index:999;background:'+colors[i%colors.length]+';';
    document.body.appendChild(el);
    var angle = Math.random()*Math.PI*2;
    var dist = 50 + Math.random()*90;
    var dx = Math.cos(angle)*dist;
    var dy = Math.sin(angle)*dist*0.6 - 30;
    el.animate([
      { transform:'translate(0,0) rotate(0deg)', opacity:1 },
      { transform:'translate('+dx+'px,'+(dy+130)+'px) rotate('+(Math.random()*720-360)+'deg)', opacity:0 }
    ], { duration:850 + Math.random()*400, easing:'cubic-bezier(.2,.8,.2,1)' });
    setTimeout((function(node){ return function(){ node.remove(); }; })(el), 1400);
  }
};

// Anime un compteur numérique de 0 (ou from) jusqu'à `to` dans el.textContent.
// Filet de sécurité par setTimeout : si l'onglet passe en arrière-plan,
// requestAnimationFrame peut être mis en pause par le navigateur et ne
// jamais finir l'animation — on force alors la valeur finale correcte.
AL.countUp = function(el, to, duration){
  duration = duration || 700;
  var from = 0, start = null, done = false;
  function finish(){
    if(done) return;
    done = true;
    el.textContent = to;
  }
  function step(ts){
    if(done) return;
    if(!start) start = ts;
    var progress = Math.min((ts - start) / duration, 1);
    el.textContent = Math.round(from + (to - from) * progress);
    if(progress < 1) requestAnimationFrame(step);
    else finish();
  }
  requestAnimationFrame(step);
  setTimeout(finish, duration + 120);
};

// ---- série de jours consécutifs, partagée par tous les modules ----
var STREAK_KEY = 'active-learning-days-v1';
function isoDate(d){
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

// À appeler depuis un module dès qu'un exercice est corrigé (juste ou faux) :
// marque la journée comme active, une seule fois par jour.
AL.markActiveDay = function(){
  try{
    var raw = localStorage.getItem(STREAK_KEY);
    var days = raw ? JSON.parse(raw) : [];
    var today = isoDate(new Date());
    if(days.indexOf(today) === -1){
      days.push(today);
      localStorage.setItem(STREAK_KEY, JSON.stringify(days));
    }
  }catch(e){}
};

// Nombre de jours consécutifs jusqu'à aujourd'hui (ou hier, pour ne pas
// casser la série avant la fin de la journée en cours).
AL.getStreak = function(){
  try{
    var raw = localStorage.getItem(STREAK_KEY);
    var days = raw ? JSON.parse(raw) : [];
    var set = {};
    days.forEach(function(d){ set[d] = true; });
    var cursor = new Date();
    cursor.setHours(0,0,0,0);
    if(!set[isoDate(cursor)]){
      cursor.setDate(cursor.getDate() - 1);
    }
    var streak = 0;
    while(set[isoDate(cursor)]){
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }catch(e){ return 0; }
};
