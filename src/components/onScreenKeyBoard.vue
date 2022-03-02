<template>
    <div class="onScreenKeyboard">
        <div class="row">
            <button
                type="button" 
                @click="keyBoardInput(key)" 
                :key="key" 
                v-for="key in keys.topRow"
                :style="`background-color: ${totalScores[key] || 'white'}; color: ${totalScores[key]? 'white': 'initial'}`"
            >
                {{key.toUpperCase()}}
            </button>
        </div>
        <div class="row">
            <button 
                type="button" 
                @click="keyBoardInput(key)" 
                :key="key" 
                v-for="key in keys.midRow"
                :style="`background-color: ${totalScores[key] || 'white'}; color: ${totalScores[key]? 'white': 'initial'}`"
            >
                {{key.toUpperCase()}}
            </button>
        </div>
        <div class="row">
            <button @click="keyBoardValidate()" type="button" class="biggerButton">
                <img src="../assets/icon-checkmark.svg" alt="Delete button">
            </button>

            <button 
                type="button" 
                @click="keyBoardInput(key)" 
                :key="key" 
                v-for="key in keys.btmRow"
                :style="`background-color: ${totalScores[key] || 'white'}; color: ${totalScores[key]? 'white': 'initial'}`"
            >
                {{key.toUpperCase()}}
            </button>
            
            <button @click="keyBoardDelete()" type="button" class="biggerButton"> 
                <img src="../assets/icon-backspace.svg" alt="Delete button">
            </button>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        totalScores: {
            type: Object,
            required: false,
        } 
    },
    data(){
        return {
            keys: {
                topRow: ['q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p'],
                midRow: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
                btmRow: ['y', 'x', 'c', 'v', 'b', 'n', 'm']
            }
        }
    },
    methods:{
        keyBoardInput(key){
            this.$emit("input", key);
        },
        keyBoardValidate(){
            this.$emit("validate");
        },
        keyBoardDelete(){
            this.$emit("delete");
        },
    }
}
</script>

<style lang="scss">
@import "../styles/style.scss";

.row{
    display: flex;
    justify-content: center;

    button{
        min-width: 10px;
        width: 40px;
        height: 60px;

        display: flex;
        justify-content: center;
        align-items: center;

        font-weight: bold;
        font-size: 20px;

        cursor: pointer;

        margin: 4px;

        border-radius: 8px;
        border: none;

        background: white;

        &:focus, &:hover{
            outline: none;
        }

        &.biggerButton{
            width: 75px;
        }

        img{
            width: 30px;
        }
    }
}

@media only screen and (max-width: 650px) {
	.row button{
        width: 35px;
        height: 50px;

        &.biggerButton{
            width: 60px;
        }
	}
}


</style>