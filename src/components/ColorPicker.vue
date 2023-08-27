<template>
  <div class="colorPickerContainer">
    <button class="blackColor" type="button" :onClick="() => setColorPalette('black')">Black</button>
    <button class="pinkColor" type="button" :onClick="() => setColorPalette('pink')">Pink</button>
    <button class="christmasColor" type="button" :onClick="() => setColorPalette('christmas')">Christmas</button>
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
        },
        christmas: {
          background: "url('https://images.unsplash.com/photo-1543589077-47d81606c1bf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3387&q=80')",
          correct: "#146B3A",
          misplaced: "#F8B229",
          wrong: "#EA4630",
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

.christmasColor {
  color: white;
  background: red;
}

</style>