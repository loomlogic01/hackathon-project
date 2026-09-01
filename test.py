import ollama as ol

response = ol.chat(model="llama3.1:8b",
    messages=[
        {"role": "user", "content": "What is 2+2? Answer in one short sentence."}
    ]
)

print(response["message"]["content"])