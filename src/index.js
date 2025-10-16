import { load } from "./logic.ts";

const canvas = document.querySelector("canvas");
const header = document.querySelector("#header");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - header.offsetHeight;
load();
