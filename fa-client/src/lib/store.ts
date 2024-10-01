import { reactive } from "vue";

interface Store {
    inGame: boolean;
    roomId: string;
    id: string;
    admin: boolean;
    gameStarted: boolean;
    userlist: Player[];
    changeColor: (data: any) => void;
}

const store = reactive<Store>({
    inGame: false,
    roomId: "",
    id: "",
    admin: false,
    gameStarted: false,
    userlist: [],

    changeColor(data) {
        const player = this.userlist.find(p => p.Id === data.Player);
        if (player) {
            player.Color = data.Color;
        } else {
            console.warn("Change color: Player not found: " + data.Player);
        }
    }
});

export default store;