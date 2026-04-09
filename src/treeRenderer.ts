import {
    drawTree,
    updateTreePositions,
    setRadialSpacing,
    setupTree,
} from "./tree";
import type { Node } from "./tree";

export default class TreeRenderer {
    radialSpacing: number = 0;
    mouseX: number | null = null;
    mouseY: number | null = null;
    selectedNode: Node | null = null;
    familyNumber: number = 0;
    rootNode: Node | null = null;

    constructor(initialSpacing: number = 0) {
        this.radialSpacing = initialSpacing;
        setRadialSpacing(this.radialSpacing);
    }

    setupTree(family: number = 0) {
        this.familyNumber = family;
        this.rootNode = setupTree(family);
    }

    setMousePos(x: number | null, y: number | null) {
        this.mouseX = x;
        this.mouseY = y;
    }

    setSelectedNode(node: Node | null) {
        this.selectedNode = node;
    }

    clearSelection() {
        this.selectedNode = null;
    }

    setRadialSpacing(value: number) {
        this.radialSpacing = value;
        setRadialSpacing(value);
    }

    setFamily(n: number) {
        this.familyNumber = n;
        // any family-specific state (logos, colors) can be managed here
    }

    draw(ctx: CanvasRenderingContext2D) {
        updateTreePositions(this.rootNode);
        drawTree(ctx, this.rootNode, this.mouseX, this.mouseY);
        // if you need to highlight selectedNode, do that here (or expose selectedNode)
    }
}
