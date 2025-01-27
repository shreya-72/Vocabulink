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

# @app.route("/")
# def index():
#     global current_index
#     # Get the next set of words (5 at a time)
#     words_to_display = game_data["Group1"][current_index:current_index + 5]
#     return render_template("index.html", data=words_to_display)

@app.route("/")
def index():
    # Get the list of group names (keys in the JSON)
    decks = game_data.keys()
    return render_template("index.html", decks=decks)

# @app.route("/group/<deck>")
# def group(deck):
#     # Get the data for the selected group
#     group_data = game_data.get(deck)
#     if group_data:
#         return render_template("group.html", data=group_data, deck_name=deck)
#     else:
#         return "Group not found", 404

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
    matches = request.json.get('matches', {})
    correct = True  # Implement your match validation logic here

    # Check if all matches are correct
    for word, definition in matches.items():
        # Implement your match checking logic, here just checking if word and definition are correct
        correct_match = any(item['word'] == word and item['definition'] == definition for item in game_data["Group1"])
        if not correct_match:
            correct = False
            break

    if correct:
        current_index += 5  # Move to the next set of 5 words
        if current_index >= len(game_data["Group1"]):  # If all words are completed
            return jsonify({"success": True, "message": "Congratulations! You've completed the game."})
        return jsonify({"success": True})
    else:
        return jsonify({"success": False, "error": "Incorrect matches. Please try again."})




if __name__ == "__main__":
    app.run(debug=True)




