const downTriggers = document.querySelectorAll("*[aria-down-snap-trigger]")
const upTriggers = document.querySelectorAll("*[aria-up-snap-trigger]")
const triggers = document.querySelectorAll("*[aria-down-snap-trigger], *[aria-up-snap-trigger]")
const blockTriggers = document.querySelectorAll("*[aria-block-trigger]")
const downHandlers = document.querySelectorAll("*[aria-down-snap-handler]")
const upHandlers = document.querySelectorAll("*[aria-up-snap-handler]")

const DURATION = 1000;/*ms*/

var currentSlide = 0
var activate = true

downTriggers.forEach((downTrigger, idx) => {
    downTrigger.downIdx = idx
})

upTriggers.forEach((upTrigger, idx) => {
    upTrigger.upIdx = idx
})

var visibleY = function (el, deltaY) {
    var rect = el.getBoundingClientRect()
    if (rect.top - deltaY > 0 && deltaY < 0) return false
    if (rect.bottom - deltaY - document.documentElement.clientHeight < 0 && deltaY > 0) return false
    return true
}

function vh(v) {
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
    return (v * h) / 100
}

function smoothScroll(elem, options) {
    return new Promise((resolve) => {
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
        const elementPosition = (scrollOptions.block == "start") ? ($(elem).position().top) : ($(elem).position().top + $(elem).height() - window.innerHeight)
        const offsetPosition = elementPosition - headerOffset

        // window.scrollTo({
        //     top: offsetPosition,
        //     behavior: "smooth",
        // })
        $('html, body').animate({scrollTop: offsetPosition}, DURATION);
        requestAnimationFrame(check)

        // this function will be called every painting frame
        // for the duration of the smooth scroll operation
        function check() {
            // check our current position
            const newPos = elem.getBoundingClientRect().top

            if (newPos === lastPos) { // same as previous
                if (same++ > 2) { // if it's more than two frames
                    /* @todo: verify it succeeded
                     * if(isAtCorrectPosition(elem, options) {
                     *   resolve();
                     * } else {
                     *   reject();
                     * }
                     * return;
                     */
                    if (currentSlide + ((scrollOptions.block == "start") ? (1) : (-1)) < downHandlers.length && currentSlide + ((scrollOptions.block == "start") ? (1) : (-1)) >= 0) {
                        currentSlide += (scrollOptions.block == "start") ? (1) : (-1)
                    }
                    console.log("animated end", currentSlide)
                    return resolve() // we've come to an halt
                }
            } else {
                same = 0 // reset our counter
                lastPos = newPos // remember our current position
            }
            // check again next painting frame
            requestAnimationFrame(check)
        }
    })
}


async function smoothScrollTo(el, blockType, offsetVH) {
    await smoothScroll(el, {block: blockType, offsetVH: offsetVH})
    activate = true
}


window.addEventListener("wheel", (event) => {
    if (activate) {
        console.log("event");
        activate = false;
        if (event.deltaY < 0 && currentSlide >= 0 && upTriggers[currentSlide].getAttribute("aria-up-snap-type") != "leave") {
            event.preventDefault();
            activate = false;
            const vh = upTriggers[currentSlide].getAttribute("aria-up-snap-trigger")
            smoothScrollTo(upHandlers[currentSlide], "end", vh)

            return false
        } else if (event.deltaY > 0 && currentSlide < downHandlers.length && downTriggers[currentSlide].getAttribute("aria-down-snap-type") != "leave") {
            event.preventDefault();
            activate = false;
            const vh = downTriggers[currentSlide].getAttribute("aria-down-snap-trigger");
            smoothScrollTo(downHandlers[currentSlide], "start", vh)

            return false
        }
        activate = true;
    } else {
        return false;
    }
}, {passive: false})

blockTriggers.forEach((blockTrigger) => {
    blockTrigger.addEventListener("wheel", (event) => {
        event.preventDefault()
        return false
    })
})
triggers.forEach((trigger, idx) => {
    trigger.addEventListener("wheel", async (event) => {
        if (activate) {
            activate = false
            if (event.deltaY < 0) {
                const idx = event.currentTarget.upIdx
                const isLock = event.currentTarget.getAttribute("aria-up-snap-trigger") != null
                if (isLock) {
                    event.preventDefault()
                    activate = false
                    smoothScrollTo(upHandlers[idx], "end", event.currentTarget.getAttribute("aria-up-snap-trigger"))
                    return false

                }
            } else if (event.deltaY > 0) {
                const idx = event.currentTarget.downIdx
                const isLock = event.currentTarget.getAttribute("aria-down-snap-trigger") != null
                if (isLock) {
                    event.preventDefault()
                    activate = false
                    smoothScrollTo(downHandlers[idx], "start", event.currentTarget.getAttribute("aria-down-snap-trigger"))
                    return false

                }
            }
            activate = true
            return true

        } else {
            event.preventDefault()
            return false
        }
    })
})