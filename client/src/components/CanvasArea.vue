<template>
    <div id="canvas-area" v-show="gameStarted" @mouseenter="setOffset()">
        <h1 v-show="gameStarted">{{ hint }}</h1>
        <h2 v-if="!fakeArtist"> {{ currentWord }} </h2>
        <h2 v-else> Você é o artista falso </h2>
        <canvas
        id="canvas"
        ref="canvas"
        @mousedown="seguraMouse()"
        @mouseout="this.mousePressed = false"
        @mouseup="this.mousePressed = false"
        @mousemove="coordenadas($event)"
        >
        </canvas>
    </div>
</template>

<script>
export default {
    name: "CanvasArea",
    props: ['fakeArtist', 'your_turn', 'gameStarted', 'hint', 'currentWord', 'color'],
    data() {
        return {
            mousePressed: false,
            pos: {
                x: 0,
                y: 0
            },
            offset: {
                x: 0,
                y: 0
            },
            ultimaPos: {
                x: 0,
                y: 0
            },
            context: {
                strokeStyle: null,
                lineWidth: null,
            },
        }
    },
    methods: {
        setOffset() {
            let rect = this.$refs.canvas.getBoundingClientRect();
            this.offset = {
                x: rect.left,
                y: rect.top
            };
        },
        setupCanvas() {
            let canvas = this.$refs.canvas;
            this.context = canvas.getContext("2d");
            canvas.width = 500;
            canvas.height = 500;
            this.context.lineCap = "round";
            this.context.strokeStyle = "black";
            this.context.lineWidth = 10;
            setInterval(() => {
                this.drawer();
            }, 50);
        },
        largaMouse() {
            this.mousePressed = false;
        },
        seguraMouse() {
            this.mousePressed = true;
            this.ultimaPos.x = this.pos.x;
            this.ultimaPos.y = this.pos.y;
        },
        coordenadas(event) {
            this.pos = {
                x: event.clientX,
                y: event.clientY
            };
            this.movement = {
                x: event.movementX,
                y: event.movementY
            };
        },
        drawer() {
            if (this.mousePressed && this.your_turn) {
                if (this.pos.x !== this.ultimaPos.x && this.pos.y !== this.ultimaPos.y) {
                    this.$socket.client.emit("sendline", {
                        from: {
                            x: this.ultimaPos.x - this.offset.x,
                            y: this.ultimaPos.y - this.offset.y
                        },
                        to: {
                            x: this.pos.x - this.offset.x,
                            y: this.pos.y - this.offset.y
                        },
                        color: this.color,
                    });
                    this.ultimaPos.x = this.pos.x;
                    this.ultimaPos.y = this.pos.y;
                }
            }
        },
        receive(from, to, color) {
            this.context.strokeStyle = color;
            this.context.beginPath();
            this.context.moveTo(from.x, from.y);
            this.context.lineTo(to.x, to.y);
            this.context.stroke();
        }
    },
    sockets: {
        gameStarted() {
            this.setupCanvas();
        },
        drawline(data) {
            this.receive(data.from, data.to, data.color);
        },
    }
}
</script>

<style lang="scss" scoped>
    #canvas {
        outline: 1px solid red;
    }
</style>