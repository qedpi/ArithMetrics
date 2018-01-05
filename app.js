new Vue({
    el: "#app",
    data: {
        game_started: false,
        response: "",
        answer: 42,

        first_num: null,
        second_num: null,

        op: null,
        ops: {0:'+', 1:'-', 2:'*', 3:'/'},
        op_symbols: {'+':'+', '-':'−', '*':'⋅', '/':'/'},
        ops_used: [true, true, true, true],
        active_ops: [0, 1, 2, 3],
        button_names: {0:'toggle-plus', 1:'toggle-minus', 2:'toggle-times', 3:'toggle-divide'},

        n_smallest: 1,
        n_largest: 99,

        start_time: null,
        response_times: [],
        score: 0,
        target_score: 50,

        low_selected: 1,
        high_selected: 2,
        options: [1, 2, 3, 4, 5],

        checked: true,
    },
    methods: {
        start_game(){
            this.score = 0;
            this.game_started = true;
            this.new_problem();
            this.start_time = this.time_format();
        },
        new_problem(){
            this.n_smallest = Math.pow(10, this.low_selected - 1);
            this.n_largest = Math.pow(10, this.high_selected) - 1;

            this.first_num = this.rand_int(this.n_smallest, this.n_largest);
            this.second_num = this.rand_int(this.n_smallest, this.n_largest);
            // gen from 1 to lcm(2, 3, 4) = 12

            /*
            if (!this.ops_used.includes(true)){
                location.reload();
            } */
            this.op = this.ops[this.active_ops[this.rand_int(0, 11) % Object.keys(this.active_ops).length]];
            if (this.op == '/'){
                // special case for division
                [this.first_num, this.answer] = [this.first_num * this.second_num, this.first_num]
            } else {
                this.answer = eval(this.first_num + ' ' + this.op + ' ' + this.second_num);
            }
            this.response = "";
        },
        rand_int(a, b){
            return Math.floor(Math.random() * (b - a + 1)) + a;
        },
        time_format(){
            return performance.now() / 1000;
        },
        play_sound_effect(id){
            // makes sure that sound effect plays from start even when it's still playing
            aud = document.getElementById(id);
            aud.pause();
            aud.currentTime = 0;
            aud.play();
        },
        toggle_op(op_id){
            this.play_sound_effect("audio_buttons");
            this.ops_used[op_id] = !this.ops_used[op_id];
            if (!this.ops_used.includes(true)){
                alert("must use at least one operator!");
                //todo: vue.js may have better way
                document.getElementById(this.button_names[op_id]).click();
            }
            this.active_ops = Object.keys(this.ops).filter(x => this.ops_used[x]);
        },
    },
    computed: {
        check_response(){
            isCorrect = this.response === String(this.answer);
            if (isCorrect){

                // Add to times
                now = this.time_format();
                // after adding, floats become inaccurate again, hence need to use toFixed
                this.response_times.push(parseFloat((now - this.start_time).toFixed(2)));
                this.start_time = now;

                this.score ++;

                if (this.score >= this.target_score){
                    this.play_sound_effect("audio_applause");
                    alert("Congrats, you've completed your daily practice!");
                    this.game_started = false;
                } else {
                    this.play_sound_effect("audio_success");
                    this.new_problem();
                }
            } else if (this.response === 's'){
                this.new_problem();
            }
        },
    },
    mounted(){
        window.addEventListener('keyup', e => {
            // Enter key to start game
            if (e.keyCode === 13 && !this.game_started){
                this.start_game();
            }
        });
    }
});
// Register a global custom directive called `v-focus`
Vue.directive('focus', {
    // When the bound element is inserted into the DOM...
    inserted: function (el) {
        // Focus the element
        el.focus()
    }
})