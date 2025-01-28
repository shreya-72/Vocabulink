from flask import Flask, render_template, request, jsonify
import random
import json

app = Flask(__name__)

# Custom filter to shuffle data
@app.template_filter('shuffle')
def shuffle_list(data):
    shuffled = data[:]
    random.shuffle(shuffled)
    return shuffled


# Load deck data from the JSON file
with open("deck_data.json", "r") as file:
    game_data = json.load(file)


current_index = 0  # Track the current set of words being displayed


@app.route("/")
def index():
    # Get the list of group names (keys in the JSON)
    decks = game_data.keys()
    return render_template("index.html", decks=decks)


@app.route("/group/<deck>/<int:page>")
def group(deck, page):
    # Number of words to display per page
    words_per_page = 5
    # Get the data for the selected group
    group_data = game_data.get(deck)
    
    if group_data:
        # Slice the group data to get only the words for this page
        start = page * words_per_page
        end = start + words_per_page
        words_to_display = group_data[start:end]
        
        # If there are no words to display (end of data), show a "no more words" message
        no_more_words = len(group_data) <= end
        
        return render_template("group.html", data=words_to_display, deck_name=deck, page=page, no_more_words=no_more_words)
    else:
        return "Group not found", 404

@app.route("/validate", methods=["POST"])
def validate():
    global current_index
    deck = request.json.get('deck') 
    matches = request.json.get('matches', {})
    correct = True  # Flag to track if all matches are correct

        # Get the data for the selected group (deck)
    group_data = game_data.get(deck)
    
    if not group_data:
        return jsonify({"success": False, "error": f"Group {deck} not found."})

        # Fetch the current group of 5 words based on current_index
    current_group = group_data[current_index:current_index + 5]
    words_in_group = {item['word'] for item in current_group}

    # Check if all words in the current group have been matched
    if len(matches) < len(words_in_group):
        return jsonify({"success": False, "error": "Please match all words before validating!"})


        # Check if all matches are correct for the selected group
    for word, definition in matches.items():
        # Check if the word and definition exist in the group data
        correct_match = any(item['word'] == word and item['definition'] == definition for item in group_data)
        if not correct_match:
            correct = False
            break

    if correct:
        current_index += len(matches) # Move to the next set of 5 words
        if current_index >= len(group_data): 
            # return jsonify({"success": True, "message": "Congratulations! You've completed the game."})
            return jsonify({"success": True, "completed": True, "message": "Congratulations! You've completed all words from this group."})
        return jsonify({"success": True, "completed": False, "message": "All matches are correct!"})
    else:
        return jsonify({"success": False, "error": "Incorrect matches. Please try again."})




if __name__ == "__main__":
    app.run(debug=True)




