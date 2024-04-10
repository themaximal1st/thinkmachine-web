export default class Animation {
    constructor(graphRef) {
        this.graphRef = graphRef;
        this.isPausing = false;
        this.isInteracting = false;
        this.animationInterval = null;
    }

    start() {
        const initialPosition = this.graphRef.current.cameraPosition();
        this.distance = Math.sqrt(Math.pow(-5, 2) + Math.pow(-500, 2)); // Set the initial distance
        this.angle = Math.atan2(-5, -500); // Set the initial angle
        this.initialY = initialPosition.y; // Store the initial Y-coordinate

        const updateCameraPosition = () => {
            if (this.isPausing || this.isInteracting) {
                // Store the current position when starting to drag
                const currentPos = this.graphRef.current.cameraPosition();
                this.dragEndPosition = {
                    x: currentPos.x,
                    y: currentPos.y,
                    z: currentPos.z,
                };
                return;
            } else if (this.dragEndPosition) {
                // Recalculate the angle and distance based on the position when dragging stopped
                this.distance = Math.sqrt(
                    Math.pow(this.dragEndPosition.x, 2) +
                    Math.pow(this.dragEndPosition.z, 2)
                );
                this.angle = Math.atan2(
                    this.dragEndPosition.x,
                    this.dragEndPosition.z
                );
                this.initialY = this.dragEndPosition.y; // Update the Y-coordinate
                this.dragEndPosition = null; // Reset the stored position
            }

            // Increment the angle for the animation
            this.angle += Math.PI / 1000;
            this.angle %= 2 * Math.PI; // Normalize the angle

            // Update camera position
            this.graphRef.current.cameraPosition({
                x: this.distance * Math.sin(this.angle),
                y: this.initialY, // Use the updated Y-coordinate
                z: this.distance * Math.cos(this.angle),
            });
        };

        this.animationInterval = setInterval(updateCameraPosition, 33); // About 30 FPS
    }

    stop() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }

        this.animationInterval = null;
    }

    interact() {
        this.isInteracting = true;
        this.pause();
    }

    stopInteracting() {
        this.isInteracting = false;
        this.resume();
    }

    pause() {
        if (this.resumeAnimationInterval) {
            clearTimeout(this.resumeAnimationInterval);
            this.resumeAnimationInterval = null;
        }

        this.isPausing = true;
    }

    resume(interval = 1000) {
        if (this.resumeAnimationInterval) return;

        this.resumeAnimationInterval = setTimeout(() => {
            this.isPausing = false;
        }, interval);
    }
}
