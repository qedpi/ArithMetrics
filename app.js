function rand_int(a, b){
    return Math.floor(Math.random() * (b - a + 1)) + a
}

function rand_elem(xs){
    if (xs instanceof Set){
        xs = Array.from(xs)
    }
    return xs[rand_int(0, xs.length - 1)]
}

function time_format_seconds(){
    return performance.now() / 1000
}

function play_sound_effect(id){
    // makes sure that sound effect plays from start even when it's still playing
    aud = document.getElementById(id)
    aud.pause()
    aud.currentTime = 0
    aud.play()
}

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
        // ops: new Set("+-*/"),
        op_symbols: {'+':'+', '-':'−', '*':'⋅', '/':'/'},
        ops_used: [true, true, true, true],
        active_ops: [0, 1, 2, 3],
        button_names: ['toggle-plus', 'toggle-minus', 'toggle-times', 'toggle-divide'],

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
            this.start_time = time_format_seconds();
        },
        new_problem(){
            this.n_smallest = Math.pow(10, this.low_selected - 1);
            this.n_largest = Math.pow(10, this.high_selected) - 1;

            this.first_num = rand_int(this.n_smallest, this.n_largest);
            this.second_num = rand_int(this.n_smallest, this.n_largest);

            this.op = this.ops[rand_elem(this.active_ops)];
            if (this.op == '/'){
                // special case for division, treat as multiplication in reverse
                [this.first_num, this.answer] = [this.first_num * this.second_num, this.first_num]
            } else {
                this.answer = eval(this.first_num + ' ' + this.op + ' ' + this.second_num);
            }
            this.response = "";
        },
        toggle_op(op_id){
            play_sound_effect("audio_buttons");
            if (op_id < 0){
                op_id = -op_id - 1
                for (let i = 0; i < 4; i ++){
                    if ((i === op_id) !== this.ops_used[i]){
                        document.getElementById(this.button_names[i]).click();
                    }
                }
            } else {
                this.ops_used[op_id] = !this.ops_used[op_id];
                if (!this.ops_used.includes(true)){
                    // alert("must use at least one operator!");
                    //todo: vue.js may have better way
                    document.getElementById(this.button_names[op_id]).click();
                }
                this.active_ops = Object.keys(this.ops).filter(x => this.ops_used[x]);
                console.log(this.active_ops)
            }
        },
    },
    computed: {
        check_response(){
            isCorrect = this.response === String(this.answer);
            now = time_format_seconds();

            if (isCorrect){
                // Add to times
                // after adding, floats become inaccurate again, so use toFixed
                this.response_times.push(parseFloat((now - this.start_time).toFixed(2)));
                this.start_time = now;

                this.score ++;

                if (this.score >= this.target_score){
                    play_sound_effect("audio_applause");
                        // alert("Congrats, you've completed your daily practice!");
                    this.game_started = false;
                } else {
                    play_sound_effect("audio_success");
                    this.new_problem();
                }
            } else if (this.response === 's'){ // user skips question
                this.start_time = now;
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