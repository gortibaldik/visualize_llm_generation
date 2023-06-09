<template>
    <form @submit="submit" class="wrapElement text-input-wrapper">
        <textarea :placeholder="defaultText" v-model="textInput" @keyup.enter="submit" />
        <button class="button-override button" type="submit">{{ buttonText }}</button>
    </form>
</template>

<script lang="ts">
import { valuesRequiredInConfiguration, ElementDescription } from '@/assets/elementRegistry';
import type ElementRegistry from '@/assets/elementRegistry';
import { PollUntilSuccessPOST } from '@/assets/pollUntilSuccessLib';
import { componentSharedData, getSharedDataUniqueName } from '@/assets/reactiveData';
import { defineComponent, shallowRef } from 'vue'

let component = defineComponent({
    data() {
        return {
            submitTextPoll: undefined as undefined | PollUntilSuccessPOST,
            textInput: "" as string,
        }
    },
    props: {
        name: {
            type: String,
            required: true
        }
    },
    inject: ['backendAddress'],
    computed: {
        buttonText(): string {
            return componentSharedData[getSharedDataUniqueName(this.name, 'buttonText')]
        },
        defaultText(): string {
            return componentSharedData[getSharedDataUniqueName(this.name, 'defaultText')]
        },
        address(): string {
            return componentSharedData[getSharedDataUniqueName(this.name, 'address')]
        }
    },
    methods: {
        submit() {
            PollUntilSuccessPOST.startPoll(
                this,
                'submitTextPoll',
                `${this.backendAddress}/${this.address}`,
                this.processResponse.bind(this),
                { text_input: this.textInput }
            )
        },
        processResponse(response: any) {
            this.$elementRegistry.retrieveElementsFromResponse(response, componentSharedData)
            this.textInput = ""
        }
    }
})

export default component
/**
 *
 * @param elementRegistry this parameter holds all the elements that can be created
 * from the backend
 */
export function registerElement(elementRegistry: ElementRegistry) {
    elementRegistry.registeredElements['text_input'] = {
        component: shallowRef(component),
        process: processElementDescr
    }
}

class ElementConfiguration extends ElementDescription {
    button_text!: string
    default_text!: string
    address!: string
}

function processElementDescr(elementDescr: ElementConfiguration) {
    valuesRequiredInConfiguration(elementDescr, ["button_text", "default_text", "address"])

    return {
        buttonText: elementDescr.button_text,
        defaultText: elementDescr.default_text,
        address: elementDescr.address
    }
}

</script>
<style scoped>
.text-input-wrapper {
    display: flex;
    flex-direction: row;
    column-gap: 10px;
    align-items: center;
}

button {
    display: flex;
}

.button-override {
    padding: 5px;
    padding-top: 7px;
}

textarea {
    display: flex;
    flex-grow: 2;
    font-family: sans-serif;
    font-weight: normal;
    padding-top: 7px;
    padding: 5px;
}
</style>
