var SprintModel = function() {
    var self = this;

    self.forms = ko.observableArray();
    self.cases = ko.observableArray();

    self.selectedForm = ko.observable();
    self.selectedQuestion = ko.observable();    // for knowing what to display in question properties
    self.selectedCase = ko.observable();        // for previewing a form that requires a case

    self.forms.push({
        name: "Registration Form",
        requiresCase: false,
        questions: [
            {
                id: 'name',
                display: 'What is your name?',
                saveToCase: 'name',
            },
            {
                id: 'age',
                display: 'What is your age?',
                saveToCase: 'age',
            },
        ],
        submissions: [
            { date: "2017-10-11 11:31", questions: { name: 'Brady', age: 38 } },
            { date: "2017-10-11 11:41", questions: { name: 'Brian', age: 33 } },
            { date: "2017-10-11 11:51", questions: { name: 'Mimi', age: 37 } },
        ],
    });
    self.forms.push({
        name: "Followup Form",
        requiresCase: true,
        questions: [
            {
                id: 'color',
                display: 'What is your favorite color?',
                saveToCase: 'favoriteColor',
            },
        ],
        submissions: [
            { date: "2017-10-21 12:31", caseName: 'Brady', questions: { color: 'pink' } },
            { date: "2017-10-21 12:31", caseName: 'Brady', questions: { color: 'red' } },
            { date: "2017-10-21 12:41", caseName: 'Brian', questions: { color: 'orange' } },
            { date: "2017-10-21 12:51", caseName: 'Mimi', questions: { color: 'yellow' } },
        ],
    });

    self.cases.push({
        name: 'Brady',
        properties: {'age': 38, 'color': 'red'},
    });
    self.cases.push({
        name: 'Brian',
        properties: {'age': 33, 'color': 'orange'},
    });
    self.cases.push({
        name: 'Mimi',
        properties: {'age': 37, 'color': 'yellow'},
    });

    /*
        forms
            questions
                display
                id
                saveToCase
            requiresCase
            submissions
                time
                responses
    */
};

$(function() {
    ko.applyBindings(new SprintModel(), document.getElementById("sprint"));
});
