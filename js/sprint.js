var QuestionModel = function(options) {
    var self = this;

    self.isCaseName = options.isCaseName;

    self.id = ko.observable(options.id);
    self.display = ko.observable(options.display);
    self.shouldSaveToCase = ko.observable(!!options.saveToCase);
    self.saveToCase = ko.observable(options.saveToCase);

    self.saveToCaseValue = ko.computed(function() {
        return self.isCaseName ? "name" : self.saveToCase();
    });
};

var SprintModel = function() {
    var self = this;

    self.debug = function() {
        debugger;
    };

    self.menus = ko.observableArray();
    self.cases = ko.observableArray();

    self.caseSchema = ko.computed(function() {
        return _.without(_.uniq(_.flatten(_.map(_.pluck(self.cases(), 'properties'), function(p) { return _.keys(p); }))), "name");
    });

    self.caseCount = 0;                         // generate case IDs
    self.formCount = 0;                         // generate form IDs
    self.questionCount = 0;                     // generate question IDs

    self.selectedForm = ko.observable();
    self.selectedQuestion = ko.observable();    // for knowing what to display in question properties
    self.selectedCase = ko.observable();        // for previewing a form that requires a case

    // For populating dropdown when adding a new case property
    self.selectedFormQuestions = ko.computed(function() {
        if (self.selectedForm()) {
            return self.selectedForm().questions;
        }
        return [];
    });

    self.selectedCaseName = ko.computed(function() {
        if (self.selectedCase()) {
            var selected = _.findWhere(self.cases(), {id: self.selectedCase()})
            if (selected) {
                return selected.name;
            }
        }
        return "";
    });

    self.previewing = ko.observable(false);
    self.previewingFeedback = ko.observable(false);
    self.restartPreview = function() {
        self.previewing(true);
        self.previewingFeedback(false);
        self.selectedCase(null);
        _.each($("#preview-form input"), function(input) { input.value = ""; });
    };

    self.showQuestionProperties = ko.computed(function() {
        return !self.previewing() && self.selectedQuestion();
    });
    self.previewingCaseList = ko.computed(function() {
        return self.previewing() && !self.previewingFeedback() && self.selectedForm().requiresCase && !self.selectedCase();
    });
    self.previewingForm = ko.computed(function() {
        return self.previewing() && !self.previewingFeedback() && (!self.selectedForm().requiresCase || self.selectedCase());
    });
    self.feedbackAction = ko.computed(function() {
        if (self.selectedForm()) {
            return self.selectedForm().requiresCase ? "updated" : "created";
        }
        return "";
    });

    self.saveProperty = function() {
        // TODO
        alert("do stuff");
    };

    self.submitForm = function(properties) {
        var form = self.selectedForm(),
            now = new Date();

        // Set up form submission
        var submission = _.defaults(properties || {}, {
            date: _.template("<%= year %>-<%= month %>-<%= day %> <%= hour %>:<%= minute %>:<%= second %>")({
                year: now.getFullYear(),
                month: now.getMonth() + 1,
                day: now.getDate(),
                hour: now.getHours(),
                minute: now.getMinutes(),
                second: now.getSeconds(),
            }),
            answers: _.reduce($("#preview-form input"), function(memo, input) { memo[input.id] = input.value; return memo; }, {}),
        });

        if (_.find(submission.answers, function(x) { return !x; })) {
            alert("Please answer all questions");
            return;
        }

        // Create or update case, and actually submit form
        var newProperties = {};
        _.each(self.selectedForm().questions(), function(q) {
            if (q.shouldSaveToCase()) {
                newProperties[q.saveToCase() || q.id()] = submission.answers[q.id()];
            }
        });
        if (form.requiresCase) {
            submission.caseName = self.selectedCaseName();
            var caseObj = _.findWhere(self.cases(), {id: self.selectedCase()});
            _.each(newProperties, function(value, key) {
                if (caseObj.properties[key]) {
                    caseObj.properties[key](value);
                } else {
                    caseObj.properties[key] = ko.observable(value);
                }
            });
            // Force cases to update in case where only new properties were
            // added (and therefore no observables were updated)
            self.cases.valueHasMutated();
        } else {
            self.cases.push({
                id: ++self.caseCount,
                name: newProperties.name || $("#preview-form input:first").val(),
                properties: _.mapObject(newProperties, function(p) { return ko.observable(p); }),
            });
        }
        form.submissions.push(submission);

        self.previewingFeedback(true);
    };

    self.addQuestion = function(properties) {
        var form = self.selectedForm();
        self.questionCount++;
        properties = properties || {};
        var question = new QuestionModel({
            isCaseName: !form.requiresCase && !form.questions().length,
            id: properties.id || 'question' + self.questionCount,
            display: properties.display || '',
            saveToCase: properties.saveToCase || '',
        });
        form.questions.push(question);
        self.selectedForm(form);
        self.selectedQuestion(question);
    };

    self.selectedForm.subscribe(function(newValue) {
        self.selectedQuestion(_.first(newValue.questions()));
        self.previewing(false);
    });

    self.selectedQuestion.subscribe(function(newValue) {
        self.previewing(false);
    });

    self.addForm = function(menuIndex, requiresCase) {
        var menuFormCount = self.menus()[menuIndex].forms().length;
        var form = {
            id: 'form' + ++self.formCount,
            name: requiresCase ? "Followup Form" + (menuFormCount > 1 ? " " + menuFormCount : "") : "Registration Form",
            requiresCase: requiresCase,
            questions: ko.observableArray([]),
            submissions: ko.observableArray([]),
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

    self.addTemplateApp = function() {
        self.addMenu();

        var menu = _.last(self.menus());
        self.selectedForm(menu.forms()[0]);
        self.addQuestion({
            id: 'name',
            display: 'What is your name?',
            saveToCase: 'name',
        });
        self.addQuestion({ id: 'age',
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
    };
};

$(function() {
    ko.applyBindings(new SprintModel(), document.getElementById("sprint"));
});
