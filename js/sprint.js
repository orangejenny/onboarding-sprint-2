var SprintModel = function() {
    var self = this;

    self.menus = ko.observableArray();
    self.cases = ko.observableArray();

    self.caseSchema = ko.computed(function() {
        return _.without(_.uniq(_.flatten(_.map(_.pluck(self.cases(), 'properties'), function(p) { return _.keys(p); }))), "name");
    });

    self.formCount = 0;                         // generate form IDs
    self.questionCount = 0;                     // generate question IDs

    self.selectedForm = ko.observable();
    self.selectedQuestion = ko.observable();    // for knowing what to display in question properties
    self.selectedCase = ko.observable();        // for previewing a form that requires a case

    self.previewing = ko.observable(false);
    self.notPreviewing = ko.computed(function() {
        return !self.previewing();
    });

    var _formSubmissions = function(requiresCase) {
        if (requiresCase) {
            return ko.observableArray([
                { date: "2017-10-21 12:31", caseName: 'Yury', questions: { color: 'pink' } },
                { date: "2017-10-21 12:36", caseName: 'Yury', questions: { color: 'red' } },
                { date: "2017-10-21 12:41", caseName: 'Brandon', questions: { color: 'orange' } },
                { date: "2017-10-21 12:51", caseName: 'Amy', questions: { color: 'yellow' } },
            ]);
        }
        return ko.observableArray([]);
    };


    self.submitForm = function(properties) {
        var form = self.selectedForm(),
            now = new Date();
        var submission = _.defaults(properties || {}, {
            date: _.template("<%= year %>-<%= month %>-<%= day %> <%= hour %>:<%= minute %>:<%= second %>")({
                year: now.getFullYear(),
                month: now.getMonth() + 1,
                day: now.getDate(),
                hour: now.getHours(),
                minute: now.getMinutes(),
                second: now.getSeconds(),
            }),
            questions: _.reduce($("#preview-form input"), function(memo, input) { memo[input.id] = input.value; return memo; }, {})
        });

        if (_.compact(_.values(submission.questions)).length !== _.keys(submission.questions).length) {
            alert("Please answer all questions");
            return;
        }

        if (form.requiresCase) {
            // TODO: set submission.caseName
        } else {
            var properties = {};
            _.each(self.selectedForm().questions, function(q) {
                if (q.saveToCase) {
                    properties[q.saveToCase] = submission.questions[q.id];
                }
            });
            self.cases.push({
                name: $("#preview-form input:first").val(),
                properties: properties,
            });
        }
        form.submissions.push(submission);
    };

    self.addQuestion = function(properties) {
        var form = self.selectedForm();
        self.questionCount++;
        var question = _.defaults(properties || {}, {
            id: 'question' + self.questionCount,
            display: '',
            saveToCase: '',
        });
        form.questions.push(question);
        self.selectedForm(form);
        self.selectedQuestion(question);
        // TODO: this doesn't update the table of form submissions' headers
    };

    self.selectedForm.subscribe(function(newValue) {
        self.selectedQuestion(_.first(newValue.questions));
        self.previewing(false);
    });

    self.selectedQuestion.subscribe(function(newValue) {
        self.previewing(false);
    });

    self.addForm = function(menuIndex, requiresCase) {
        var form = {
            id: 'form' + self.formCount++,
            name: requiresCase ? "Followup Form" : "Registration Form",
            requiresCase: requiresCase,
            questions: [],
            submissions: _formSubmissions(requiresCase),
        };
        self.menus()[menuIndex].forms.push(form);
        self.selectedForm(form);
    };

    self.addMenu = function() {
        var index = self.menus().length;
        self.menus.push({ forms: ko.observableArray([]) });
        self.addForm(index, false);
        self.addForm(index, true);
        self.selectedForm(_.first(self.menus()[index].forms()));
    };

    self.allForms = ko.computed(function() {
        return _.flatten(_.map(self.menus(), function(m) { return m.forms(); }))
    });

    self.populate = function() {
        self.addMenu();

        var menu = _.last(self.menus());
        self.selectedForm(menu.forms()[0]);
        self.addQuestion({
            id: 'name',
            display: 'What is your name?',
            saveToCase: 'name',
        });
        self.addQuestion({
            id: 'age',
            display: 'What is your age?',
            saveToCase: 'age',
        });
        self.selectedForm(menu.forms()[1]);
        self.addQuestion({
            id: 'color',
            display: 'What is your favorite color?',
            saveToCase: 'favoriteColor',
        });
        self.selectedForm(menu.forms()[0]);

        self.cases.push({
            name: 'Yury',
            properties: {'age': 38, 'color': 'red'},
        });
        self.cases.push({
            name: 'Brandon',
            properties: {'age': 33, 'color': 'orange'},
        });
        self.cases.push({
            name: 'Amy',
            properties: {'age': 37, 'color': 'yellow'},
        });
    };
};

$(function() {
    ko.applyBindings(new SprintModel(), document.getElementById("sprint"));
});
