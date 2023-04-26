from typing import List, MutableSet, Optional, Protocol, TypeVar


class NamedProtocol(Protocol):
    @property
    def name(self) -> str:
        ...

    @name.setter
    def name(self, value):
        ...


T = TypeVar("T", bound=NamedProtocol)


def register_named(
    named: T,
    registered_names_set: MutableSet[str],
    registered_named_list: Optional[List[T]] = None,
):
    """Append `value` with property `value.name` to `registered_names_list`
    while preserving the invariant that no other value in that list has the
    same name as the currently registered `value`.

    It is arranged in such a way that an integer is appended after the name.
    E.g. after registering 5 components with name `n`. The registered names
    would be the following ones: [n, n_1, n_2, n_3, n_4]
    """
    ix = 1
    c_name = named.name

    if c_name in registered_names_set:
        c_name = f"{named.name}_{ix}"
        while c_name in registered_names_set:
            ix += 1
            c_name = f"{named.name}_{ix}"
        named.name = c_name
    if registered_named_list is not None:
        registered_named_list.append(named)
    registered_names_set.add(named.name)


def sanitize_url(url: str):
    """Sanitize URL.

    As of now:
        - makes str lowercase
        - removes all whitespace from the url
    """
    sanitized = "".join(url.lower().split())
    if sanitized[0] != "/":
        sanitized = "/" + sanitized
    return sanitized
