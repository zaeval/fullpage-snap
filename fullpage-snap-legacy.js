const downTriggers = document.querySelectorAll("*[aria-down-snap-trigger]")
const upTriggers = document.querySelectorAll("*[aria-up-snap-trigger]")
const triggers = document.querySelectorAll("*[aria-down-snap-trigger], *[aria-up-snap-trigger]")
const blockTriggers = document.querySelectorAll("*[aria-block-trigger]")
const downHandlers = document.querySelectorAll("*[aria-down-snap-handler]")
const upHandlers = document.querySelectorAll("*[aria-up-snap-handler]")

let debugMode = false

downTriggers.forEach((downTrigger, idx) => {
    downTrigger.downIdx = idx
})

upTriggers.forEach((upTrigger, idx) => {
    upTrigger.upIdx = idx
})

var visibleY = function(el, deltaY) {
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
        const scrollOptions = Object.assign({ behavior: "smooth" }, options)
        console.log("animated")
        // let's begin
        const headerOffset = vh(scrollOptions.offsetVH)
        const elementPosition = elem.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
        })
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
                    console.log("animated end")
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

var activate = true

async function smoothScrollTo(el, blockType, offsetVH) {
    await smoothScroll(el, { block: blockType, offsetVH: offsetVH })
    activate = true
}

blockTriggers.forEach((blockTrigger) => {
    const isMouse = !(event.wheelDeltaY ? event.wheelDeltaY === -3 * event.deltaY : event.deltaMode === 0) || debugMode;
    blockTrigger.addEventListener("wheel", (event) => {
        if(isMouse) {
            event.preventDefault()
            return false
        }
    })
})
triggers.forEach((trigger, idx) => {
    trigger.addEventListener("wheel", async (event) => {
        const isMouse = !(event.wheelDeltaY ? event.wheelDeltaY === -3 * event.deltaY : event.deltaMode === 0) || debugMode;
        console.log(isMouse);
        if (activate && isMouse) {
            activate = false
            if (event.deltaY < 0) {
                const idx = event.currentTarget.upIdx
                const isLock = event.currentTarget.getAttribute("aria-up-snap-trigger") != null
                if (isLock) {
                    if (trigger.getAttribute("aria-up-snap-type") != "leave" || !visibleY(event.currentTarget, event.deltaY)) {
                        event.preventDefault()
                        activate = false
                        smoothScrollTo(upHandlers[idx], "end", event.currentTarget.getAttribute("aria-up-snap-trigger"))
                        return false
                    }
                }
            } else if (event.deltaY > 0) {
                const idx = event.currentTarget.downIdx
                const isLock = event.currentTarget.getAttribute("aria-down-snap-trigger") != null
                if (isLock) {
                    if (trigger.getAttribute("aria-down-snap-type") != "leave" || !visibleY(event.currentTarget, event.deltaY)) {
                        event.preventDefault()
                        activate = false
                        smoothScrollTo(downHandlers[idx], "start", event.currentTarget.getAttribute("aria-down-snap-trigger"))
                        return false
                    }
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