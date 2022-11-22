const downTriggers = document.querySelectorAll("*[aria-down-snap-trigger]")
const upTriggers = document.querySelectorAll("*[aria-up-snap-trigger]")
const triggers = document.querySelectorAll("*[aria-down-snap-trigger], *[aria-up-snap-trigger]")
const blockTriggers = document.querySelectorAll("*[aria-block-trigger]")
const downHandlers = document.querySelectorAll("*[aria-down-snap-handler]")
const upHandlers = document.querySelectorAll("*[aria-up-snap-handler]")

let debugMode = true
var DURATION = 500 /* ms */
var animateEl = null;
var offset = null;
var isAnimated = false;
var animateTrigger = null;
var triggerType = null;

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
const onWheel = (event) => {
    // const isMouse = !(event.wheelDeltaY ? event.wheelDeltaY === -3 * event.deltaY : event.deltaMode === 0) || debugMode;
    // console.log('isMouse:', isMouse, 'isActive:', activate);
    const trigger = event.currentTarget;
    console.log(trigger);
    if (event.deltaY < 0) {
        const idx = trigger.upIdx
        const isLock = trigger.getAttribute("aria-up-snap-trigger") != null
        if (isLock) {
            event.preventDefault()
            activate = false
            console.log("locked")
            trigger.removeEventListener("wheel", onWheel)
            const offset = event.currentTarget.getAttribute("aria-up-snap-trigger");
            setTimeout(() => {
                window.addEventListener("wheel", blockWheel, {passive: false})
                smoothScrollTo(upHandlers[idx], "end", offset, trigger)
            }, 100);
            return false
        }
    } else if (event.deltaY > 0) {
        const idx = event.currentTarget.downIdx
        const isLock = event.currentTarget.getAttribute("aria-down-snap-trigger") != null
        if (isLock) {
            event.preventDefault()
            activate = false
            console.log("locked")
            trigger.removeEventListener("wheel", onWheel)
            const offset = event.currentTarget.getAttribute("aria-down-snap-trigger");
            setTimeout(() => {
                window.addEventListener("wheel", blockWheel, {passive: false})
                smoothScrollTo(downHandlers[idx], "start", offset, trigger)
            }, 100)
            return false
        }
    }
    return false
}

function vh(v) {
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
    return (v * h) / 100
}

var activate = true

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

    isAnimated = true;
    $('html').stop().animate({scrollTop: offsetPosition}, {
        duration: DURATION, complete: () => {
            console.log("animated end")
            trigger.addEventListener('wheel', onWheel)
            console.log('addEl trigger', trigger)
            window.removeEventListener("wheel", blockWheel)
            console.log('active wheel')
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

triggers.forEach((trigger, idx) => {
    trigger.addEventListener("wheel", onWheel)
})