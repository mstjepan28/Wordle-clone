<template>
  <div class="colorPickerContainer">
    <button class="blackColor" type="button" :onClick="() => setColorPalette('black')">Black</button>
    <button class="pinkColor" type="button" :onClick="() => setColorPalette('pink')">Pink</button>
  </div>
</template>

<script>
export default {
  methods: {
    setColorPalette(colorPalette) {
      const palette = {
        pink: {
          background: "#f4acb7",
          correct: "#d8e2dc",
          misplaced: "#9d8189",
          wrong: "#ffe5d9",
        },
        black: {
          background: "#171a1b",
          correct: "#577F45",
          misplaced: "#c9b458",
          wrong: "#5e6468",
        }
      }[colorPalette];

      if(!palette) {
        return;
      }

      localStorage.setItem("colorPalette", JSON.stringify(palette))
      location.reload()
    } 
  }
}
</script>

<style lang="scss">
@import "../styles/style.scss";

.colorPickerContainer {
  display: flex;
  justify-content: center;
  align-items: center;
  column-gap: 2rem;

	& > button {
    min-width: 6rem;
    font-size: 20px;
    font-weight: 500;
		padding: 0.5rem;

    border: 2px solid white;
    border-radius: 100px;

		outline: none;
    cursor: pointer;
	}
}

.blackColor {
  color: white;
  background: #171a1b;
}

.pinkColor {
  color: white;
  background: pink;
}

</style>