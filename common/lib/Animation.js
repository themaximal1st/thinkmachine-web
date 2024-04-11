export default class Animation {
    constructor(graphRef) {
        this.graphRef = graphRef;
        this.isPausing = false;
        this.isInteracting = false;
        this.animationInterval = null;
    }


    start(callback = null) {
        const initialPosition = this.graphRef.current.cameraPosition();
        this.distance = Math.sqrt(
            Math.pow(initialPosition.x, 2) +
            Math.pow(initialPosition.z, 2)
        );
        // Normalize the starting angle to be within 0 to 2π
        this.cumulativeRotation = (Math.atan2(initialPosition.x, initialPosition.z) + 2 * Math.PI) % (2 * Math.PI);
        this.initialY = initialPosition.y;

        const rotationIncrement = Math.PI / 333;
        const fullCircle = 2 * Math.PI;
        let totalAddedRotation = 0; // This will track the total rotation added since the start

        const updateCameraPosition = () => {
            if (this.isPausing || this.isInteracting) {
                const currentPos = this.graphRef.current.cameraPosition();
                this.dragEndPosition = {
                    x: currentPos.x,
                    y: currentPos.y,
                    z: currentPos.z,
                };
                return;
            } else if (this.dragEndPosition) {
                // Recalculate distance based on the dragEndPosition
                this.distance = Math.sqrt(
                    Math.pow(this.dragEndPosition.x, 2) +
                    Math.pow(this.dragEndPosition.z, 2)
                );
                // Adjust the cumulativeRotation and totalAddedRotation based on the new position
                let newAngle = (Math.atan2(this.dragEndPosition.x, this.dragEndPosition.z) + 2 * Math.PI) % (2 * Math.PI);
                totalAddedRotation += (newAngle - this.cumulativeRotation + 2 * Math.PI) % (2 * Math.PI);
                this.cumulativeRotation = newAngle;
                this.initialY = this.dragEndPosition.y;
                this.dragEndPosition = null;
            }

            // Add the increment to both cumulativeRotation and totalAddedRotation
            this.cumulativeRotation = (this.cumulativeRotation + rotationIncrement) % fullCircle;
            totalAddedRotation += rotationIncrement;

            // Check if a full rotation has been completed
            if (totalAddedRotation >= fullCircle) {
                if (callback) {
                    callback(this.cumulativeRotation);
                }
                // Reset totalAddedRotation after a full rotation to start tracking the next rotation
                totalAddedRotation -= fullCircle; // This accounts for slightly more than one rotation due to the increment
            }

            this.graphRef.current.cameraPosition({
                x: this.distance * Math.sin(this.cumulativeRotation),
                y: this.initialY,
                z: this.distance * Math.cos(this.cumulativeRotation),
            });
        };

        this.animationInterval = setInterval(updateCameraPosition, 33);
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

    resume(interval = 0) {
        if (this.resumeAnimationInterval) return;

        this.resumeAnimationInterval = setTimeout(() => {
            this.isPausing = false;
        }, interval);
    }
}
