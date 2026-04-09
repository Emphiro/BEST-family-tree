const verticalSpacing = 200;
const horizontalSpacing = 70;
let radialSpacing = 70;
const centerSpacing = 150;
const lineWidth = 2;
const logoSize = centerSpacing - 25;

const lineColor = "#ffffff";
const textColor = "#ffffff";
let family_number = 0;

export function setupTree(family: number = 0): Node {
    console.log("Setting up the tree...");

    logos = logo_src.map((src) => {
        const img = new Image();
        img.src = src;
        return img;
    });

    family_number = family;
    const familyTree = loadJsonTree(family);
    return familyTree;
}

export enum Status {
    ACTIVE = "active",
    INACTIVE = "inactive",
    ALUMNI = "alumni",
    HEAD = "head",
    BABY = "baby",
    ROOT = "root",
}

const statusColors = [
    {
        [Status.ACTIVE]: "#24a7a1",
        [Status.INACTIVE]: "#808080",
        [Status.ALUMNI]: "#808080",
        [Status.HEAD]: "#ffa615",
        [Status.BABY]: "#24a7a1",
        [Status.ROOT]: "#808080",
    },
    {
        [Status.ACTIVE]: "#95686b",
        [Status.INACTIVE]: "#808080",
        [Status.ALUMNI]: "#808080",
        [Status.HEAD]: "#ffa615",
        [Status.BABY]: "#615833ff",
        [Status.ROOT]: "#808080",
    },
];

const logo_src = ["assets/perry_logo.jpg", "assets/tea_logo.jpg"];

let logos: Array<HTMLImageElement> = [];

export class Node {
    name: string;
    id: number;
    parent: number | null;
    children: Array<Node>;
    status: Status;
    position: { x: number; y: number };
    depth: number;
    angularCoordinate: number;
    angularInterval: number;
    weight: number;

    constructor(
        name: string,
        id: number,
        status: Status,
        parent: number | null = null,
    ) {
        this.name = name;
        this.id = id;
        this.children = [];
        this.status = status;
        this.parent = parent;
    }

    addChild(child: Node) {
        this.children.push(child);
    }

    removeChild(id: number) {
        this.children = this.children.filter((child) => child.id !== id);
    }

    getChildren(): Array<Node> {
        return this.children;
    }

    findNode(id: number): Node | null {
        if (this.id === id) {
            return this;
        }
        for (const child of this.children) {
            const found = child.findNode(id);
            if (found) {
                return found;
            }
        }
        return null;
    }

    calculateDepth(currentDepth: number = 0): number {
        this.depth = currentDepth;
        let maxDepth = currentDepth;
        for (const child of this.children) {
            const childDepth = child.calculateDepth(currentDepth + 1);
            maxDepth = Math.max(maxDepth, childDepth);
        }
        return maxDepth;
    }
    calculateWeight(maxDepth: number): number {
        if (this.children.length === 0) {
            this.weight = 1 * (maxDepth - this.depth + 1);
            return this.weight;
        }
        let weight = 0;
        for (const child of this.children) {
            weight += child.calculateWeight(maxDepth);
        }
        this.weight = weight;
        return weight;
    }

    generateTreeMap(
        map: Map<number, Array<Node>> = new Map(),
    ): Map<number, Array<Node>> {
        if (!map.has(this.depth)) {
            map.set(this.depth, []);
        }
        map.get(this.depth).push(this);
        for (const child of this.children) {
            child.generateTreeMap(map);
        }
        return map;
    }

    calculateAngularCoordinates(
        parentInterval: number,
        parentAngle: number,
        parentWeight: number,
        accumulatedWeight: number = 0,
    ) {
        this.angularInterval = (parentInterval * this.weight) / parentWeight;
        let accumulatedInterval =
            (parentInterval * accumulatedWeight) / parentWeight; // Interval offset due to previous siblings

        this.angularCoordinate = parentAngle + accumulatedInterval;

        let accumulated = 0;
        for (const child of this.children) {
            accumulated += child.calculateAngularCoordinates(
                this.angularInterval,
                this.angularCoordinate,
                this.weight,
                accumulated,
            );
        }

        this.angularCoordinate += this.angularInterval / 2; // Center the node in its interval
        return this.weight;
    }

    angularToCartesian() {
        const radius =
            this.depth === 0
                ? 0
                : (this.depth - 1) * radialSpacing + centerSpacing;
        this.position = {
            x: radius * Math.cos(this.angularCoordinate),
            y: radius * Math.sin(this.angularCoordinate),
        };
        for (const child of this.children) {
            child.angularToCartesian();
        }
    }

    setPosition(x: number, y: number = this.depth * verticalSpacing) {
        this.position = { x, y };
    }
}

function calculatePositions(
    treeMap: Map<number, Array<Node>>,
    maxDepth: number,
) {
    for (let depth = 0; depth <= maxDepth; depth++) {
        const nodesAtDepth = treeMap.get(depth);
        const basePos = ((-nodesAtDepth.length + 1) * horizontalSpacing) / 2;
        for (const node of nodesAtDepth) {
            node.setPosition(
                basePos + nodesAtDepth.indexOf(node) * horizontalSpacing,
            );
        }
    }
}

export function setRadialSpacing(newSpacing: number) {
    radialSpacing = newSpacing;
}

function addChildToTree(rootNode: Node, parentId: number, member: Node) {
    const parentNode = rootNode.findNode(parentId);
    for (const fatherless of rootNode.getChildren()) {
        if (fatherless.parent === member.id) {
            member.addChild(fatherless);
            rootNode.removeChild(fatherless.id);
        }
    }
    if (parentNode) {
        parentNode.addChild(member);
    } else {
        rootNode.addChild(member);
    }
}

function drawLine(
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;
    ctx.stroke();
}

function drawNode(
    ctx: CanvasRenderingContext2D,
    node: Node,
    mouse_x: number = null,
    mouse_y: number = null,
) {
    if (node.status === Status.ROOT) {
        drawLogo(ctx, node, mouse_x, mouse_y);
        return;
    }
    // Dynamically calculate box width based on text length
    ctx.font = "12px Roboto, sans-serif";
    const textMetrics = ctx.measureText(node.name);
    const padding = 20;
    const boxWidth = Math.max(70, textMetrics.width + padding);
    const boxHeight = 30;
    const cornerRadius = 8;
    const x = node.position.x - boxWidth / 2;
    const y = node.position.y - boxHeight / 2;

    // Draw rounded rectangle
    ctx.beginPath();
    ctx.moveTo(x + cornerRadius, y);
    ctx.lineTo(x + boxWidth - cornerRadius, y);
    ctx.quadraticCurveTo(x + boxWidth, y, x + boxWidth, y + cornerRadius);
    ctx.lineTo(x + boxWidth, y + boxHeight - cornerRadius);
    ctx.quadraticCurveTo(
        x + boxWidth,
        y + boxHeight,
        x + boxWidth - cornerRadius,
        y + boxHeight,
    );
    ctx.lineTo(x + cornerRadius, y + boxHeight);
    ctx.quadraticCurveTo(x, y + boxHeight, x, y + boxHeight - cornerRadius);
    ctx.lineTo(x, y + cornerRadius);
    ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
    ctx.closePath();

    ctx.fillStyle = statusColors[family_number][node.status];
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = lineColor;
    ctx.stroke();

    // Draw node name centered in the box
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node.name, node.position.x, node.position.y);
}

export function drawTree(
    ctx: CanvasRenderingContext2D,
    node: Node,
    mouse_x: number = null,
    mouse_y: number = null,
) {
    node.angularToCartesian();
    for (const child of node.getChildren()) {
        drawLine(
            ctx,
            node.position.x,
            node.position.y,
            child.position.x,
            child.position.y,
        );
        drawTree(ctx, child, mouse_x, mouse_y);
    }
    drawNode(ctx, node, mouse_x, mouse_y);
}

export function updateTreePositions(node: Node) {
    node.angularToCartesian();
}

import data0 from "../data_extraction/members_0.json";
import data1 from "../data_extraction/members_1.json";
const data = [data0, data1];
function loadJsonTree(family: number): Node {
    const rootNode = new Node("root", -1, Status.ROOT);
    const membersMap = new Map<string, Node>();

    for (const member of data[family]) {
        const { name, id, parent, status } = member;
        const memberStatus: Status = Status[status as keyof typeof Status];
        const node = new Node(name, id, memberStatus, parent);
        addChildToTree(rootNode, parent, node);
    }

    const maxDepth = rootNode.calculateDepth();
    //const treeMap = rootNode.generateTreeMap();
    rootNode.calculateWeight(maxDepth);
    rootNode.angularCoordinate = 0;
    rootNode.angularInterval = 2 * Math.PI;

    //calculatePositions(treeMap, maxDepth);
    rootNode.calculateAngularCoordinates(
        rootNode.angularInterval,
        rootNode.angularCoordinate,
        rootNode.weight,
    );
    rootNode.angularToCartesian();
    return rootNode;
}

function drawLogo(
    ctx: CanvasRenderingContext2D,
    node: Node,
    mouse_x: number = null,
    mouse_y: number = null,
) {
    const logo = logos[family_number];
    logo.src = logo_src[family_number];

    // Draw a grey circle as background for the logo
    ctx.save();
    ctx.beginPath();
    ctx.arc(node.position.x, node.position.y, logoSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = "#808080";
    ctx.fill();
    ctx.restore();

    // Draw circular clipped image
    ctx.save();
    ctx.beginPath();
    ctx.arc(node.position.x, node.position.y, logoSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(
        logo,
        node.position.x - logoSize / 2,
        node.position.y - logoSize / 2,
        logoSize,
        logoSize,
    );
    ctx.restore();
    let selected = false;
    if (
        mouse_x != null &&
        mouse_y != null &&
        intersectLogo(mouse_x, mouse_y, ctx.canvas)
    ) {
        selected = true;
    }

    // Draw border
    if (selected) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(node.position.x, node.position.y, logoSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)"; // transparent grey overlay
        ctx.fill();
        ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(node.position.x, node.position.y, logoSize / 2, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = lineColor;
    ctx.stroke();
}

export function intersectLogo(
    x: number,
    y: number,
    canvas: HTMLCanvasElement,
): boolean {
    return x * x + y * y <= (logoSize / 2) * (logoSize / 2);
}
