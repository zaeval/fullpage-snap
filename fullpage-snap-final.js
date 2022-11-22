const downTriggers = document.querySelectorAll("*[aria-down-snap-trigger]")
const upTriggers = document.querySelectorAll("*[aria-up-snap-trigger]")
const blockTriggers = document.querySelectorAll("*[aria-block-trigger]")
const downHandlers = document.querySelectorAll("*[aria-down-snap-handler]")
const upHandlers = document.querySelectorAll("*[aria-up-snap-handler]")

let debugMode = true
var DURATION = 500 /* ms */

downTriggers.forEach((downTrigger, idx) => {
    downTrigger.downIdx = idx
    if (debugMode)
        $(downTrigger).css({backgroundColor: 'rgba(255,0,0,.3)'})
})

upTriggers.forEach((upTrigger, idx) => {
    upTrigger.upIdx = idx
    if (debugMode) {
        $(upTrigger).css({backgroundColor: 'rgba(0,0,255,.3)'})
        if ($(upTrigger).has('aria-down-snap-trigger')) {
            $(upTrigger).css({backgroundColor: 'rgba(255,0,255,.3)'})

        }
    }
})


function vh(v) {
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
    return (v * h) / 100
}

function smoothScrollTo(elem, blockType, offsetVH, trigger) {
    const options = {block: blockType, offsetVH: offsetVH}
    if (!(elem instanceof Element)) {
        throw new TypeError("Argument 1 must be an Element")
    }
    let same = 0 // a counter
    let lastPos = null // last known Y position
    // pass the user defined options along with our default
    const scrollOptions = Object.assign({behavior: "smooth"}, options)
    console.log("animated")
    // let's begin
    const headerOffset = vh(scrollOptions.offsetVH)
    const elementPosition = elem.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset

    $('html').stop().animate({scrollTop: offsetPosition}, {
        duration: DURATION, complete: () => {
            window.removeEventListener("wheel", blockWheel)
            window.addEventListener('wheel', wheelProcess)
        }
    })
}

const blockWheel = (e) => {
    e.preventDefault();
    console.log("wheel blocked");
    return false;
}

blockTriggers.forEach((blockTrigger) => {
    blockTrigger.addEventListener("wheel", (event) => {
        event.preventDefault()
        return false
    })
})

const wheelProcess = (event) => {
    let trigger = document.elementFromPoint(event.clientX, event.clientY);
    if (trigger.getAttribute('aria-up-snap-trigger') != null || trigger.getAttribute('aria-down-snap-trigger') != null || trigger.querySelector('*[aria-down-snap-trigger], *[aria-up-snap-trigger]') != null) {
        if (event.deltaY < 0) {
            const idx = trigger.upIdx
            const isLock = trigger.getAttribute("aria-up-snap-trigger") != null
            if(!isLock){
                trigger = trigger.querySelector('*[aria-up-snap-trigger]')
            }
            if (isLock) {
                event.preventDefault()
                console.log("locked")
                window.removeEventListener("wheel", wheelProcess)
                const offset = trigger.getAttribute("aria-up-snap-trigger");
                setTimeout(() => {
                    window.addEventListener("wheel", blockWheel, {passive: false})
                    smoothScrollTo(upHandlers[idx], "end", offset, trigger)
                }, 0);
                return false;
            }
        } else if (event.deltaY > 0) {
            const idx = trigger.downIdx
            const isLock = trigger.getAttribute("aria-down-snap-trigger") != null
            if(!isLock){
                trigger = trigger.querySelector('*[aria-down-snap-trigger]')
            }
            if (isLock) {
                event.preventDefault()

                console.log("locked")
                window.removeEventListener("wheel", wheelProcess)
                const offset = trigger.getAttribute("aria-down-snap-trigger");
                setTimeout(() => {
                    window.addEventListener("wheel", blockWheel, {passive: false})
                    smoothScrollTo(downHandlers[idx], "start", offset, trigger)
                }, 0)
                return false;
            }
        }
    }
}
window.addEventListener('wheel', wheelProcess)