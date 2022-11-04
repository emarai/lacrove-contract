import os
metadata = open("sample-metadata/9.json").read()
for i in range(1, 100):
    if i != 9:
        f = open("sample-metadata/{}.json".format(i), "w+")
        f.write(metadata.replace("Lacrove #9", "Lacrove #{}".format(i)))
        f.close()
        os.system("cp sample-metadata/9.png sample-metadata/{}.png".format(i))
