const root = document.documentElement;

if( !document.getElementsByTagName("main")[0].classList.contains("post") )
{
    window.onload = function() {            
        function doFunnyThing() {
            var time = (document.timeline.currentTime / 1000) - 35;
            if( time > 0 )
            {
                var rot = time / 20;
                var scale = time / 90;
                document.getElementsByTagName("body")[0].style.transform = "rotate(" + (rot) + "deg) scale( " + Math.max( 100 - scale, 0 ) + "% )";
            }
        }
        setInterval(doFunnyThing, 1);
    }
}
else
{
    console.log("post page, ignoring secret...");
}

// https://stackoverflow.com/a/16156057
function logKey(e) {
    var m_posx = 0, m_posy = 0, e_posx = 0, e_posy = 0,
           obj = this;
    //get mouse position on document crossbrowser
    if (!e){e = window.event;}
    if (e.pageX || e.pageY){
        m_posx = e.pageX - ( obj.offsetWidth  / 2.0 );
        m_posy = e.pageY - ( obj.offsetHeight / 4.0 );
    } else if (e.clientX || e.clientY){
        m_posx = e.clientX + document.body.scrollLeft
                           + document.documentElement.scrollLeft;
        m_posy = e.clientY + document.body.scrollTop
                           + document.documentElement.scrollTop;
+ (e.target.clientHeight / 2.0) 
    }
    //get parent element position in document
    if (obj.offsetParent){
        do { 
            e_posx += obj.offsetLeft;
            e_posy += obj.offsetTop;
        } while (obj = obj.offsetParent);
    }
    
    // mouse position minus elm position is mouseposition relative to element:
    root.style.setProperty('--mouse-x', m_posx-e_posx);
    root.style.setProperty('--mouse-y', m_posy-e_posy);
}

document.querySelectorAll('div.card').forEach(function(item) {
    item.addEventListener("mousemove", logKey);
});