"use client";

import { useState } from "react";
import { useAutomation } from "../../context/AutomationContext";
import { AutomationRule, AutomationResourceType } from "../../types/automation";
import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Chip,
  Button,
  Switch,
  Tooltip,
  Pagination,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "@nextui-org/react";
import { 
  PencilIcon, 
  TrashIcon, 
  InformationCircleIcon,
  PlayIcon
} from "@heroicons/react/24/outline";
import RuleDetails from "./RuleDetails";

interface RuleListProps {
  onEdit: (ruleId: string) => void;
}

export default function RuleList({ onEdit }: RuleListProps) {
  const { rules, updateRule, deleteRule } = useAutomation();
  const [page, setPage] = useState(1);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deleteConfirmRule, setDeleteConfirmRule] = useState<AutomationRule | null>(null);
  const deleteModal = useDisclosure();
  const rowsPerPage = 10;

  const handleToggleEnabled = async (rule: AutomationRule) => {
    await updateRule(rule.id, { enabled: !rule.enabled });
  };

  const handleDeleteRule = async () => {
    if (deleteConfirmRule) {
      await deleteRule(deleteConfirmRule.id);
      deleteModal.onClose();
      setDeleteConfirmRule(null);
    }
  };

  const confirmDelete = (rule: AutomationRule) => {
    setDeleteConfirmRule(rule);
    deleteModal.onOpen();
  };

  const viewRuleDetails = (rule: AutomationRule) => {
    setSelectedRule(rule);
    onOpen();
  };

  const pages = Math.ceil(rules.length / rowsPerPage);
  const items = rules.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const getResourceTypeChip = (type: AutomationResourceType) => {
    switch (type) {
      case AutomationResourceType.ISSUE:
        return <Chip color="success" size="sm">Issues</Chip>;
      case AutomationResourceType.PULL_REQUEST:
        return <Chip color="primary" size="sm">Pull Requests</Chip>;
      case AutomationResourceType.BOTH:
        return <Chip color="secondary" size="sm">Issues & PRs</Chip>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (rules.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <InformationCircleIcon className="h-12 w-12 mx-auto text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No automation rules</h3>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          You haven't created any automation rules yet. Create your first rule to automate your GitHub workflow.
        </p>
      </div>
    );
  }

  return (
    <>
      <Table
        aria-label="Automation rules table"
        bottomContent={
          pages > 1 ? (
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={page}
                total={pages}
                onChange={(page) => setPage(page)}
              />
            </div>
          ) : null
        }
        classNames={{
          wrapper: "min-h-[222px]",
        }}
      >
        <TableHeader>
          <TableColumn>NAME</TableColumn>
          <TableColumn>TYPE</TableColumn>
          <TableColumn>CREATED</TableColumn>
          <TableColumn>ENABLED</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody items={items}>
          {(rule) => (
            <TableRow key={rule.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-bold">{rule.name}</span>
                  {rule.description && (
                    <span className="text-tiny text-default-500">{rule.description}</span>
                  )}
                </div>
              </TableCell>
              <TableCell>{getResourceTypeChip(rule.resourceType)}</TableCell>
              <TableCell>{formatDate(rule.createdAt)}</TableCell>
              <TableCell>
                <Switch
                  isSelected={rule.enabled}
                  onValueChange={() => handleToggleEnabled(rule)}
                  size="sm"
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Tooltip content="View details">
                    <Button isIconOnly size="sm" variant="light" onPress={() => viewRuleDetails(rule)}>
                      <InformationCircleIcon className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Edit rule">
                    <Button isIconOnly size="sm" variant="light" onPress={() => onEdit(rule.id)}>
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Delete rule" color="danger">
                    <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => confirmDelete(rule)}>
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Rule Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="3xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Rule Details: {selectedRule?.name}
              </ModalHeader>
              <ModalBody>
                {selectedRule && <RuleDetails rule={selectedRule} />}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={() => {
                  onClose();
                  if (selectedRule) {
                    onEdit(selectedRule.id);
                  }
                }}>
                  Edit Rule
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Confirm Deletion
              </ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete the rule "{deleteConfirmRule?.name}"?</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone.</p>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="danger" onPress={handleDeleteRule}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
