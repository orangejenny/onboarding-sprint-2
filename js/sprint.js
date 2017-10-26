var SprintModel = function() {
    var self = this;

    self.menus = ko.observableArray();
    self.cases = ko.observableArray();

    self.caseSchema = ko.computed(function() {
        return _.uniq(_.flatten(_.map(_.pluck(self.cases(), 'properties'), function(p) { return _.keys(p); })));
    });

    self.selectedForm = ko.observable();
    self.selectedQuestion = ko.observable();    // for knowing what to display in question properties
    self.selectedCase = ko.observable();        // for previewing a form that requires a case

    self.menus.push({
        forms: [
            {
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
                    { date: "2017-10-11 11:31", questions: { name: 'Yury', age: 38 } },
                    { date: "2017-10-11 11:41", questions: { name: 'Brandon', age: 33 } },
                    { date: "2017-10-11 11:51", questions: { name: 'Amy', age: 37 } },
                ],
            },
            {
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
                    { date: "2017-10-21 12:31", caseName: 'Yury', questions: { color: 'pink' } },
                    { date: "2017-10-21 12:36", caseName: 'Yury', questions: { color: 'red' } },
                    { date: "2017-10-21 12:41", caseName: 'Brandon', questions: { color: 'orange' } },
                    { date: "2017-10-21 12:51", caseName: 'Amy', questions: { color: 'yellow' } },
                ],
            },
        ],
    });

    self.selectedForm(self.menus()[0].forms[0]);

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
