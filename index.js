function animationStep(play, name, duration, ...args) {
    return {
        name: name,
        duration: duration,
        play: (element) => play(element, duration, ...args),
    };
}

let heartBeat = null;
addListeners();

function addListeners() {
    document
        .getElementById('fadeInPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('fadeInBlock');
            animaster().fadeIn(block, 5000);
        });

    document.getElementById('movePlay').addEventListener('click', function () {
        const block = document.getElementById('moveBlock');
        animaster().move(block, 1000, { x: 100, y: 10 });
    });

    document.getElementById('scalePlay').addEventListener('click', function () {
        const block = document.getElementById('scaleBlock');
        animaster().scale(block, 1000, 1.25);
    });

    document
        .getElementById('fadeOutPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('fadeOutBlock');
            animaster().fadeOut(block, 5000);
        });

    document
        .getElementById('moveAndHidePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('moveAndHideBlock');
            animaster().moveAndHide(block, 1000, 1.25);
        });

    document
        .getElementById('moveAndHideReset')
        .addEventListener('click', function () {
            const block = document.getElementById('moveAndHideBlock');
            animaster().resetMoveAndHide(block, 1000, 1.25);
        });

    document
        .getElementById('showAndHidePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('showAndHideBlock');
            animaster().showAndHide(block, 1000, 1.25);
        });

    document
        .getElementById('heartBeatingPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('heartBeatingBlock');
            heartBeat = animaster().heartBeating(block);
        });

    document
        .getElementById('heartBeatingStop')
        .addEventListener('click', function () {
            const block = document.getElementById('heartBeatingBlock');
            if (heartBeat) {
                heartBeat.stop();
                heartBeat = null;
            }
        });
}

function getTransform(translation, ratio) {
    const result = [];
    if (translation) {
        result.push(`translate(${translation.x}px,${translation.y}px)`);
    }
    if (ratio) {
        result.push(`scale(${ratio})`);
    }
    return result.join(' ');
}

function animaster() {
    const resetFadeIn = function (element) {
        element.style.transitionDuration = null;
        element.classList.remove('show');
        element.classList.add('hide');
    };

    const resetFadeOut = function (element) {
        element.style.transitionDuration = null;
        element.classList.remove('hide');
        element.classList.add('show');
    };

    const resetMoveAndScale = function (element) {
        element.style.transitionDuration = null;
        element.style.transform = null;
    };

    const fadeIn = function (element, duration) {
        element.style.transitionDuration = `${duration}ms`;
        element.classList.remove('hide');
        element.classList.add('show');
    };

    const fadeOut = function (element, duration) {
        element.style.transitionDuration = `${duration}ms`;
        element.classList.remove('show');
        element.classList.add('hide');
    };

    const transform = function (element, duration, translation, ratio) {
        element.style.transitionDuration = `${duration}ms`;
        element.style.transform = getTransform(translation, ratio);
    };

    return {
        _steps: [],
        _stopHeartBeating: false,
        _translation: { x: 0, y: 0 },
        _ratio: 1,

        fadeIn: function (element, duration) {
            this.addFadeIn(duration).play(element);
        },

        move: function (element, duration, translation) {
            this.addMove(duration, translation).play(element);
        },

        scale: function (element, duration, ratio) {
            this.addScale(duration, ratio).play(element);
        },

        fadeOut: function (element, duration) {
            this.addFadeOut(duration).play(element);
        },

        moveAndHide: function (element, duration) {
            this.addMove(duration * 0.4, { x: 100, y: 20 }).addFadeOut(
                duration * 0.6
            ).play(element);
        },

        resetMoveAndHide: function (element) {
            resetMoveAndScale(element);
            resetFadeOut(element);
        },

        showAndHide: function (element, duration) {
            this.addFadeIn(duration / 3)
                .addDelay(duration / 3)
                .addFadeOut(duration / 3)
                .play(element);
        },

        heartBeating: function (element) {
            let timerId = null;
            const self = this;

            function step1() {
                self.scale(element, 500, 1.4);
                timerId = setTimeout(step2, 500);
            }

            function step2() {
                self.scale(element, 500, 1);
                timerId = setTimeout(step1, 500);
            }

            step1();

            return {
                stop: function () {
                    clearTimeout(timerId);
                },
            };
        },

        addMove: function (duration, translation) {
            const ratioNow = this._ratio;
            this._steps.push(
                animationStep(
                    (element, duration, translation) =>
                        transform(element, duration, translation, ratioNow),
                    'move',
                    duration,
                    translation
                )
            );
            this._translation = translation;
            return this;
        },

        addFadeIn: function (duration) {
            this._steps.push(animationStep(fadeIn, 'fadeIn', duration));
            return this;
        },

        addFadeOut: function (duration) {
            this._steps.push(animationStep(fadeOut, 'fadeOut', duration));
            return this;
        },

        addScale: function (duration, ratio) {
            const translationNow = { ...this._translation };
            this._steps.push(
                animationStep(
                    (element, duration, ratio) =>
                        transform(element, duration, translationNow, ratio),
                    'move',
                    duration,
                    ratio
                )
            );
            this._ratio = ratio;
            return this;
        },

        addDelay: function (duration) {
            this._steps.push(animationStep(() => {}, 'delay', duration));
            return this;
        },

        play: function (element) {
            let previousDuration = 0;
            this._steps.forEach((step) => {
                setTimeout(() => {
                    step.play(element);
                }, previousDuration);
                previousDuration += step.duration;
            });
        },
    };
}

console.log(animaster());
