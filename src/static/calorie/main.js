$(function(){
    // 用来传递全局事件
    var app = {};
    _.extend(app, Backbone.Events);

    // 用来拉取最近摄入的饮食
    var MostFoods = Backbone.Collection.extend({
          url: 'api/most_foods'
    });

    // 用来提交一次饮食记录
    var FoodRecord = Backbone.Model.extend({
          url: 'api/food_record'
    });

    // 显示食物搜索功能, 会出发app的food-selected事件
    var FoodSelectView = Backbone.View.extend({
        initialize: function(){
            this.most_foods = new MostFoods();
            this.all_foods = new Backbone.Collection(food_calories); //food_calories 是全局的

            _.bindAll(this, "render");
            _.bindAll(this, "add_food_click");
            _.bindAll(this, "search_food_click");
            _.bindAll(this, "add_input_food_click");

            this.search_food_results = [];
            this.active_tab = 'tab-lastest-food-active';

            this.most_foods.bind("reset", this.render);
            this.most_foods.fetch();

            this.render();
        },
        el: "#placeholder-food-select",
        template: $('#tpl-food-select').html(),
        events: {
            "click .add-food-item": "add_food_click",
            "click .btn-add-input-food": "add_input_food_click",
            "click .btn-search-food": "search_food_click",
        },
        render: function() {
            var data = {most_foods: this.most_foods.toJSON(),
                        search_food_results: this.search_food_results}; 
            data[this.active_tab] = true;
            var html = Mustache.render(this.template, data);
            $(this.el).html(html);
        },
        add_food_click: function(e) {
            var food = $(e.target).data('id');
            food = this.all_foods.find(function(x){return x.get(0) == food;});
            app.trigger("food-selected", {name: food.get(0), calorie: food.get(1)});
        },
        search_food_click: function(e) {
            var keyword = this.$('.txt-food-keyword').val();
            if (keyword.length < 1) return;
            var foods = this.all_foods.filter(function(x){return x.get(0).indexOf(keyword) != -1;});
            this.search_food_results = _.map(foods, function(x){return x.toJSON()});
            this.active_tab = 'tab-search-food-active';
            this.render();
        },
        add_input_food_click: function(e){
            var name = this.$('#txt_food_name').val();
            var calorie = this.$('#txt_food_calorie').val();
            if (!(name && calorie)) {
                return;
            }
            app.trigger("food-selected", {name: name, calorie: parseInt(calorie)});
        }
    });

    var FoodResultView = Backbone.View.extend({
        initialize: function(){
            this.total = 0;
            this.foods = [];

            _.bindAll(this, "render");
            _.bindAll(this, "on_food_selected");
            app.bind("food-selected", this.on_food_selected);

            this.render(); 
        },
        el: "#placeholder-food-select-result",
        template: $('#tpl-food-select-result').html(),
        render: function(){
            var html = Mustache.render(this.template, {
                total:this.total,
                foods: this.foods
            });
            $(this.el).html(html);
        },
        on_food_selected: function(food){
            this.foods.push(food);
            this.total += food.calorie;
            this.render();
        },
        events: {
            "click .delete-food-item": "delete_food_item",
            "click .btn-submit-food-record": "submit_food_record"
        },
        delete_food_item: function(e){
            // 只删除满足条件的第一项
            var food = $(e.target).data('id');

            var founds = _.filter(this.foods, function(x){ return x.name == food; });
            food = founds.pop(); // 删除一项

            // reject会删除所有满足条件的项, 所以还要把不该删除的加回去
            var foods = _.reject(this.foods, function(x) {return x.name == food.name;});
            _.each(founds, function(x){foods.push(x)});
            this.foods = foods;

            this.total -= food.calorie;
            this.render();
        },
        submit_food_record: function(e) {
            alert(this.foods.length + ':' + this.total);
            var record = new FoodRecord({total: this.total, foods: this.foods});
            record.save();
        }
    });

    // 显示食物选择部分
    var food_select_view = new FoodSelectView({ app: app });
    // 显示食物结算结果
    var food_result_view = new FoodResultView({ app: app });

});
