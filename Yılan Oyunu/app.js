const containerHeight = 600;
const containerWidth = 500;
const snakeWidth = 20;
let timeInterval = 100;
const container = document.querySelector(".snake-container");

class Food {
  x = 0;
  y = 0;
  foodElement = null;
  isCreated = false;

  render() {
    if (!this.isCreated) {
      const foodElement = document.createElement("span");
      this.foodElement = foodElement;
      this.isCreated = true;
      container.appendChild(foodElement);
    }
    const left = ((Math.random() * 1000) % containerWidth) - 20;
    const top = ((Math.random() * 1000) % containerHeight) - 20;
    this.foodElement.classList.add("food");

    this.foodElement.style.left = `${left}px`;
    this.foodElement.style.top = `${top}px`;
  }
}

class Snake {
  x = 0;
  y = 0;
  head = false;
  snakeElement = null; // HTMLElement
}

class SnakeGame {
  snakeList = []; // Snake Array
  interval = null;
  snakeDirection = "right";
  moveQueue = [];
  food = new Food();

  initialSnake() {
    const snake1 = new Snake();
    snake1.x = containerWidth / 3;
    snake1.y = containerHeight / 2;
    snake1.head = true;
    const snake2 = new Snake();
    snake2.x = containerWidth / 3 - snakeWidth;
    snake2.y = containerHeight / 2;
    const snake3 = new Snake();
    snake3.x = containerWidth / 3 - snakeWidth * 2;
    snake3.y = containerHeight / 2;

    this.snakeList = [snake1, snake2, snake3];

    this.snakeList.forEach((_snake) => {
      this.addSnake(_snake);
    });
  }

  addSnake(_snake) {
    const snake = document.createElement("span");
    _snake.snakeElement = snake;
    snake.style.transform = `translate(${_snake.x}px,${_snake.y}px)`;
    snake.classList.add("snake");
    container.appendChild(snake);
  }

  /**
   *
   * @param direction left,right, up and down
   */
  move() {
    this.interval && clearInterval(this.interval);
    this.food.render();
    this.boxDetection();
    this.snakeInterval();
  }

  snakeInterval() {
    this.interval = setInterval(() => {
      const nextDirection = this.moveQueue.shift();

      nextDirection && (this.snakeDirection = nextDirection);

      let prevX = 0;
      let prevY = 0;
      this.snakeList.forEach((_snake, index) => {
        if (_snake.head) {
          prevX = _snake.x;
          prevY = _snake.y;
          this.direction(_snake)[this.snakeDirection]();
        } else {
          const prev = [_snake.x, _snake.y];
          _snake.x = prevX;
          _snake.y = prevY;
          prevX = prev[0];
          prevY = prev[1];
        }

        this.nextStep(_snake);
        this.foodDetection();
      });
    }, timeInterval);
  }

  nextStep(_snake) {
    _snake.snakeElement.style.transform = `translate(${_snake.x}px,${_snake.y}px)`;
  }

  addQueue(direction) {
    this.moveQueue.push(direction);
  }

  direction(snake) {
    return {
      right: () => (snake.x += snakeWidth),
      left: () => (snake.x -= snakeWidth),
      up: () => (snake.y -= snakeWidth),
      down: () => (snake.y += snakeWidth),
    };
  }

  keyboardAction() {
    document.addEventListener("keydown", (e) => {
      const direction = e.code.toLowerCase().replace("arrow", "");
      const isSame = direction === this.snakeDirection;
      const isOpposite =
        (this.snakeDirection === "right" && direction === "left") ||
        (this.snakeDirection === "left" && direction === "right") ||
        (this.snakeDirection === "up" && direction === "down") ||
        (this.snakeDirection === "down" && direction === "up");

      const isPossible = !isSame && !isOpposite;
      isPossible && this.addQueue(direction);
    });
  }

  boxDetection() {
    const snakeHead = this.snakeList.filter((_snk) => _snk.head)[0];

    const headObs = new IntersectionObserver(
      (cb) => {
        if (cb[0].intersectionRatio < 1) {
          action();
        }
      },
      { threshold: 0.9, rootMargin: "20px" }
    );
    headObs.observe(snakeHead.snakeElement);
    const action = () => {
      clearInterval(this.interval);
      headObs.unobserve();
    };
  }

  foodDetection() {
    if (this.isCollide()) {
      const snakeTail = this.snakeList[this.snakeList.length - 1];
      const _tail = new Snake();
      _tail.x = snakeTail.x;
      _tail.y = snakeTail.y;
      this.snakeList.push(_tail);
      this.addSnake(_tail);
      this.food.render();
      //timeInterval -= 2;
      clearInterval(this.interval);
      this.snakeInterval();
    }
  }

  isCollide() {
    const foodElement = this.food.foodElement.getBoundingClientRect();
    const snakeElement = this.snakeList
      .filter((_snk) => _snk.head)[0]
      .snakeElement.getBoundingClientRect();

    return !(
      foodElement.y + foodElement.height < snakeElement.y ||
      foodElement.y > snakeElement.y + snakeElement.height ||
      foodElement.x + foodElement.width < snakeElement.x ||
      foodElement.x > snakeElement.x + snakeElement.width
    );
  }

  async play() {
    this.initialSnake();
    this.keyboardAction();
    this.addQueue("right");
    this.move();
  }
}

const _snake = new SnakeGame();
_snake.play();
