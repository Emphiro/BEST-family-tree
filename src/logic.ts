import { Node, setRadialSpacing, Status, intersectLogo } from "./tree";

import TreeRenderer from "./treeRenderer";

let selected_family: number = 0;

const family_names: string[] = ["Perry Family", "Tea Family"];

let lastTime: number = 0;
let ctx: CanvasRenderingContext2D;
let canvas: HTMLCanvasElement;
const header: HTMLElement = document.querySelector("#header");
const minSpreadingSpeed = 0.1; // Speed at which the radial spacing increases
const maxSpreadingSpeed = 0.3; // Maximum speed at which the radial spacing can increase
const radialSpacingEpsilon = 1; // Small value to prevent overshooting
let targetRadialSpacing = 100; // Maximum radial spacing
let offsetX = 0;
let offsetY = 0;
let scale = 1;
let oldX: number = 0;
let oldY: number = 0;
let dragged: boolean = false;
let radialSpacing = 0;
let mouseX: number = null;
let mouseY: number = null;

let treeRenderer = new TreeRenderer(radialSpacing);

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

function update(deltaTime: number) {
    // Your per-frame logic here
    //console.debug(`Frame updated. Delta time: ${deltaTime.toFixed(2)} ms`);
    if (radialSpacing < targetRadialSpacing - radialSpacingEpsilon) {
        let acceleration =
            deltaTime *
            clamp(
                Math.abs(targetRadialSpacing - radialSpacing) / 100,
                minSpreadingSpeed,
                maxSpreadingSpeed,
            );
        radialSpacing += Math.min(
            acceleration,
            targetRadialSpacing - radialSpacing,
        );
        setRadialSpacing(radialSpacing);
    } else if (radialSpacing > targetRadialSpacing + radialSpacingEpsilon) {
        let acceleration =
            deltaTime *
            clamp(
                Math.abs(targetRadialSpacing - radialSpacing) / 100,
                minSpreadingSpeed,
                maxSpreadingSpeed,
            );
        radialSpacing -= Math.min(
            acceleration,
            radialSpacing - targetRadialSpacing,
        );
        setRadialSpacing(radialSpacing);
    }
    draw();
    treeRenderer.draw(ctx);

    // Example: move a sprite, update physics, etc.
}

// The main loop
function gameLoop(timestamp: number) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    update(deltaTime);

    requestAnimationFrame(gameLoop);
}

function draw() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - header.offsetHeight;

    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset any existing transforms
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY); // Apply new transforms

    treeRenderer.draw(ctx);
}

function check_clicked_switch_families(x: number, y: number) {
    if (intersectLogo(treeRenderer.mouseX, treeRenderer.mouseY, canvas)) {
        switch_families();
    }
}

// Start the loop

export function load() {
    const try_canvas = document.querySelector("canvas");
    if (try_canvas === null) {
        console.error("Canvas element not found");
        return;
    }
    canvas = try_canvas;
    const try_ctx = canvas.getContext("2d");
    if (try_ctx === null) {
        console.error("Failed to get canvas context");
        return;
    }
    ctx = try_ctx;
    offsetX = canvas.width / 2;
    offsetY = canvas.height / 2;

    document.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") {
            targetRadialSpacing -= 10;
        } else if (event.key === "ArrowRight") {
            targetRadialSpacing += 10;
        } else if (event.key === "f" || event.key === "F") {
            switch_families();
        }
    });
    document.addEventListener("mousedown", (event) => {
        dragged = true;
        oldX = event.clientX;
        oldY = event.clientY;
        check_clicked_switch_families(event.clientX, event.clientY);
    });
    document.addEventListener("mousemove", (event) => {
        if (dragged) {
            const dx = event.clientX - oldX;
            const dy = event.clientY - oldY;
            offsetX += dx;
            offsetY += dy;
            oldX = event.clientX;
            oldY = event.clientY;
        }
        getMousePos(event);
    });
    document.addEventListener("mouseup", () => {
        dragged = false;
    });

    canvas.addEventListener("wheel", (event) => {
        event.preventDefault();
        const zoomFactor = 1.1;
        if (event.deltaY < 0) {
            scale *= zoomFactor;
        } else {
            scale /= zoomFactor;
        }
    });
    // Touch events for dragging and pinch-zoom
    let lastTouchDist: number | null = null;
    let lastTouchX: number = 0;
    let lastTouchY: number = 0;

    canvas.addEventListener("touchstart", (event) => {
        if (event.touches.length === 1) {
            dragged = true;
            lastTouchX = event.touches[0].clientX;
            lastTouchY = event.touches[0].clientY;
        } else if (event.touches.length === 2) {
            dragged = false;
            const dx = event.touches[0].clientX - event.touches[1].clientX;
            const dy = event.touches[0].clientY - event.touches[1].clientY;
            lastTouchDist = Math.sqrt(dx * dx + dy * dy);
        }
    });

    canvas.addEventListener(
        "touchmove",
        (event) => {
            if (event.touches.length === 1 && dragged) {
                const dx = event.touches[0].clientX - lastTouchX;
                const dy = event.touches[0].clientY - lastTouchY;
                offsetX += dx;
                offsetY += dy;
                lastTouchX = event.touches[0].clientX;
                lastTouchY = event.touches[0].clientY;
            } else if (event.touches.length === 2 && lastTouchDist !== null) {
                const dx = event.touches[0].clientX - event.touches[1].clientX;
                const dy = event.touches[0].clientY - event.touches[1].clientY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (lastTouchDist > 0) {
                    const zoom = dist / lastTouchDist;
                    scale *= zoom;
                }
                lastTouchDist = dist;
            }
            event.preventDefault();
        },
        { passive: false },
    );

    canvas.addEventListener("touchend", (event) => {
        if (event.touches.length < 2) {
            lastTouchDist = null;
        }
        if (event.touches.length === 0) {
            dragged = false;
        }
    });
    let button = document.getElementById("family-switch-button");
    button.addEventListener("click", switch_families);

    treeRenderer.setupTree();
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function switch_families() {
    const name_header = document.getElementById("family-tree-title");
    const button = document.getElementById("family-switch-button");
    button.classList.remove("family-button-" + selected_family);
    selected_family = (selected_family + 1) % family_names.length;
    button.classList.add("family-button-" + selected_family);
    name_header.innerText = family_names[selected_family] + " Tree";
    treeRenderer.setupTree(selected_family);
    radialSpacing = 0;
    targetRadialSpacing = 100;
    setRadialSpacing(radialSpacing);
    offsetX = canvas.width / 2;
    offsetY = canvas.height / 2;
}

function getMousePos(event: MouseEvent): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    let mouseX = (event.clientX - rect.left - offsetX) / scale;
    let mouseY = (event.clientY - rect.top - offsetY) / scale;
    treeRenderer.setMousePos(mouseX, mouseY);
    return {
        x: mouseX,
        y: mouseY,
    };
}

//function drawMousePos() {
//    const pos = { x: mouseX, y: mouseY };
//    console.log("drawing mouse pos at", pos);
//    ctx.fillStyle = "red";
//    ctx.fillRect(pos.x, pos.y, 4, 4);
//}
