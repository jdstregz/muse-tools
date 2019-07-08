import itertools

def subsets(seq):
    for mask in itertools.product([False, True], repeat=len(seq)):
        yield [item for x, item in zip(mask, seq) if x]

def ordered_groups(seq):
    for indices in subsets(range(1, len(seq))):
        indices = [0] + indices + [len(seq)]
        yield [seq[a:b] for a,b in zip(indices, indices[1:])]

for group in ordered_groups(["Hello","My","Name","Is","Josh"]):
    print group

for sub in subsets(["Hello", "My", "Name", "Is", "Josh"]):
    print sub


