import { useEffect, useRef, useState } from "react";
import { useDispatch,useSelector } from "react-redux";
import { Col } from "react-bootstrap";

import useContentLabel from "../../../../hooks/useContentLabel";
import getOccupationsByCategoryApi from "../../../../api/skillOwner/mySkill/getOccupationsByCategoryApi";

import { fetchCategoryMaster } from "../../../../reducer/masterTables/categorySlice";
import { setDropdownOptions, setIsOccupationApiLoading, setSelectedCategoryObj } from "../../../../reducer/mySkills/AddMultipleSkillsSlice";
import icons from '../../../../constants/icons';

import CouresSkillSearchThruOccupation from "./CouresSkillSearchThruOccupation";

const CouresSkillSearchThruCategory = ({isActiveCard}) => {
    const contentLabel = useContentLabel();
    const dispatch = useDispatch();
    const selectedLanguage = useSelector((state) => state.language);
    const { selectedCategoryObj } = useSelector((state) => state.addMultipleSkills);
    const { data: categoryMasterData, status: categorymasterStatus } =
        useSelector((state) => state.categoryRedux);

    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState("");
    const inputRef = useRef();
    const dropdownRef = useRef();

    useEffect(() => {
        if (categorymasterStatus === 'idle') {
            dispatch(fetchCategoryMaster());
        }
    }, [dispatch, categorymasterStatus]);

    const handleCategorySelect = async (category) => {
        dispatch(setSelectedCategoryObj(category || null));
        setCategoryFilter(category?.categoryName || '');
        dispatch(setDropdownOptions({ key: 'occupations', value: [] }));
        setDropdownVisible(false);
        dispatch(setIsOccupationApiLoading(true));

        try {
            const res = await getOccupationsByCategoryApi({
                category: category?.categoryName,
                mlanguage: selectedLanguage,
            });

            const occupationOptions = res?.data
                ?.filter((o) => o.occupationName)
                .sort((a, b) => a.occupationName.localeCompare(b.occupationName))
                .map((occupation) => ({
                    ...occupation,
                    id: occupation.id,
                    name: occupation.occupationName,
                }));

            dispatch(setDropdownOptions({ key: 'occupations', value: occupationOptions }));
        } catch (error) {
            console.error('Error fetching occupations by category:', error);
        } finally {
            dispatch(setIsOccupationApiLoading(false));
        }
    };

    const handleBlur = (e) => {
        const related = e.relatedTarget;
        const clickedOutside =
            !dropdownRef.current?.contains(related) && !inputRef.current?.contains(related);

        if (clickedOutside) {
            setDropdownVisible(false);

            // Clear input only if nothing was selected
            if (!selectedCategoryObj?.categoryName || selectedCategoryObj.categoryName !== categoryFilter) {
                setCategoryFilter('');
            }
        }
    };

    return (
        <>
            <Col sm={6}>
                <label className="form-label fw-bold">
                    {contentLabel('Category', 'nf Category')}
                </label>
                <div className="position-relative mb-4">
                    <input
                        ref={inputRef}
                        className="form-control"
                        placeholder={contentLabel('PleaseSelectACategory', 'Please select a category')}
                        value={categoryFilter}
                        onChange={(e) => {
                            setCategoryFilter(e.target.value);
                            setDropdownVisible(true);
                        }}
                        onFocus={() => {
                            setDropdownVisible(true);
                            setCategoryFilter('');
                            dispatch(setSelectedCategoryObj(null));
                        }}
                        onBlur={handleBlur}
                    />

                    <span
                        style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            pointerEvents: 'none',
                            fontSize: '0.9rem',
                            color: '#999',
                        }}
                    >
                        <icons.KeyboardArrowDownIcon />
                    </span>

                    {isDropdownVisible && (
                        <ul
                            ref={dropdownRef}
                            className="dropdown-menu show w-100 mt-1"
                            style={{ maxHeight: 150, overflowY: 'auto' }}
                        >
                            {categorymasterStatus === 'loading' ? (
                                <li className="dropdown-item text-muted no-hover-list">
                                    {contentLabel('Loading', 'nf Loading')}...
                                </li>
                            ) : (
                                <>
                                    {categoryMasterData
                                        .filter((c) =>
                                            c.categoryName.toLowerCase().includes(categoryFilter.toLowerCase())
                                        )
                                        .sort((a, b) => a.categoryName.localeCompare(b.categoryName))
                                        .map((category, index) => (
                                            <li
                                                key={category.id}
                                                tabIndex={0}
                                                className="dropdown-item list-group-item-action"
                                                onClick={() => handleCategorySelect(category)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleCategorySelect(category);
                                                    }
                                                }}
                                            >
                                                {category.categoryName}
                                            </li>
                                        ))}
                                    {categoryMasterData.filter((c) =>
                                        c.categoryName.toLowerCase().includes(categoryFilter.toLowerCase())
                                    ).length === 0 && (
                                            <li
                                                className="dropdown-item text-muted no-hover-list"
                                                style={{ opacity: 0.6 }}
                                            >
                                                {contentLabel('NoOptions', 'No Options')}
                                            </li>
                                        )}
                                </>
                            )}
                        </ul>
                    )}
                </div>
            </Col>

            <Col sm={6}></Col>

            {selectedCategoryObj && <CouresSkillSearchThruOccupation isActiveCard={isActiveCard} usedInCategory={true} />}
        </>
    );
};

export default CouresSkillSearchThruCategory;