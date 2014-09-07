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
            _.bindAll(this, "most_food_click");
            _.bindAll(this, "search_food_click");
            _.bindAll(this, "clear_search_click");

            this.search_food_results = [];

            this.most_foods.bind("reset", this.render);
            this.most_foods.fetch();

            this.render();
        },
        el: "#placeholder-food-select",
        template: $('#tpl-food-select').html(),
        events: {
            "click .most-food-item": "most_food_click",
            "click .btn-search-food": "search_food_click",
            "click .clear-search": "clear_search_click"
        },
        render: function() {
            var data = {most_foods: this.most_foods.toJSON(),
                        search_food_results: this.search_food_results}; 
            var html = Mustache.render(this.template, data);
            $(this.el).html(html);
        },
        most_food_click: function(e) {
            var food = $(e.target).data('id');
            food = this.all_foods.find(function(x){return x.get(0) == food;});
            app.trigger("food-selected", food);
        },
        search_food_click: function(e) {
            var keyword = this.$('.txt-food-keyword').val();
            if (keyword.length < 1) return;
            var foods = this.all_foods.filter(function(x){return x.get(0).indexOf(keyword) != -1;});
            this.search_food_results = _.map(foods, function(x){return x.toJSON()});
            this.render();
        },
        clear_search_click: function(){
            this.search_food_results = []; 
            this.render();
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
            this.foods.push(food.toJSON());
            this.total += food.get(1);
            this.render();
        }
    });

    var AddFoodRecordView = Backbone.View.extend({
    });

    // 显示食物选择部分
    var food_select_view = new FoodSelectView({ app: app });
    // 显示食物结算结果
    var food_result_view = new FoodResultView({ app: app });

});
